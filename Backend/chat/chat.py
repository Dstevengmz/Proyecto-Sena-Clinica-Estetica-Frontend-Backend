import os
from typing import List, Tuple, Optional

import mysql.connector
from mysql.connector import Error

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

try:
    import spacy
    try:
        nlp = spacy.load("es_core_news_sm")
    except Exception:
        nlp = None  
except ImportError:
    spacy = None
    nlp = None



SPANISH_STOPWORDS = {
    "de", "la", "que", "el", "en", "y", "a", "los", "del", "se", "las", "por", "un",
    "para", "con", "no", "una", "su", "al", "lo", "como", "más", "pero", "sus", "le",
    "ya", "o", "este", "sí", "porque", "esta", "entre", "cuando", "muy", "sin", "sobre",
    "también", "me", "hasta", "hay", "donde", "quien", "desde", "todo", "nos", "durante",
    "todos", "uno", "les", "ni", "contra", "otros", "ese", "eso", "ante", "ellos", "e",
    "esto", "mí", "antes", "algunos", "qué", "unos", "yo", "otro", "otras", "otra", "él",
}


def extract_keywords(text: str) -> List[str]:
    """Extrae palabras clave (sustantivos/adjetivos) en minúsculas.
    Si spaCy no está disponible, usa un fallback básico filtrando stopwords y longitudes.
    """
    text = (text or "").strip().lower()
    if not text:
        return []

    if nlp is not None:
        doc = nlp(text)
        tokens = [t.lemma_.strip() for t in doc if t.pos_ in {"NOUN", "ADJ"} and not t.is_stop and t.is_alpha]
        # Quitar duplicados preservando orden
        seen = set()
        keywords = []
        for tok in tokens:
            if tok and tok not in seen:
                keywords.append(tok)
                seen.add(tok)
        return keywords

    # Fallback simple
    words = [w for w in text.split() if w.isalpha() and len(w) > 2 and w not in SPANISH_STOPWORDS]
    # Quitar duplicados preservando orden
    seen = set()
    keywords = []
    for w in words:
        if w not in seen:
            keywords.append(w)
            seen.add(w)
    return keywords


def build_like_query(columns: List[str], keywords: List[str]) -> Tuple[str, Tuple[str, ...]]:
    """Construye un WHERE con OR de LIKE por cada palabra y columna de forma segura.
    Devuelve (sql_where, params)
    """
    clauses = []
    params: List[str] = []
    for kw in keywords:
        for col in columns:
            clauses.append(f"{col} LIKE %s")
            params.append(f"%{kw}%")
    if not clauses:
        return "1=0", tuple()  # Fuerza vacío si no hay palabras
    where = "(" + " OR ".join(clauses) + ")"
    return where, tuple(params)


class ChatBot:
    """ChatBot para consultas de procedimientos de la clínica.

    - Extrae palabras clave de la consulta (spaCy o fallback).
    - Busca por nombre/descripcion/categoría con LIKE (sin suponer FULLTEXT).
    - Limita resultados y elimina duplicados.
    """

    def __init__(self, connection: Optional[mysql.connector.connection.MySQLConnection] = None) -> None:
        self._conn = connection or self._connect()

    def _connect(self) -> mysql.connector.connection.MySQLConnection:
        host = os.getenv("DB_HOST", "localhost")
        user = os.getenv("DB_USER", "root")
        password = os.getenv("DB_PASSWORD", "")
        database = os.getenv("DB_NAME", "clinicaesteticasena")

        # Aviso si usamos credenciales por defecto (mejor mover a variables de entorno)
        if not os.getenv("DB_PASSWORD"):
            print("[aviso] Usando contraseña vacía desde variables de entorno. Configure DB_PASSWORD para mayor seguridad.")

        try:
            conn = mysql.connector.connect(host=host, user=user, password=password, database=database)
            return conn
        except Error as e:
            raise RuntimeError(f"No se pudo conectar a MySQL: {e}")

    def buscar_servicio(self, query: str, limit: int = 10) -> str:
        keywords = extract_keywords(query)
        if not keywords:
            return "No pude identificar palabras clave relevantes. Prueba con el nombre del procedimiento o categoría."

        where, params = build_like_query(["nombre", "descripcion", "categoria"], keywords)
        sql = (
            "SELECT DISTINCT nombre, descripcion, categoria "
            "FROM procedimientos "
            f"WHERE {where} "
            "LIMIT %s"
        )
        params = params + (limit,)

        try:
            with self._conn.cursor() as cur:
                cur.execute(sql, params)
                rows = cur.fetchall()
        except Error as e:
            return f"Ocurrió un error consultando los procedimientos: {e}"

        if not rows:
            pistas = ", ".join(keywords[:3])
            return (
                "No encontré coincidencias para tu consulta. "
                f"Prueba con términos relacionados a: {pistas} o sé más específico."
            )

        # Formatear respuesta
        lines = ["Encontré estos procedimientos para ti:"]
        for nombre, descripcion, categoria in rows:
            lines.append(f"- {nombre}: {descripcion} (Categoría: {categoria})")
        return "\n".join(lines)

    def close(self) -> None:
        try:
            if self._conn and self._conn.is_connected():
                self._conn.close()
        except Exception:
            pass


def run_cli() -> None:
    """Pequeño CLI para pruebas locales."""
    bot = ChatBot()
    print("Asistente: Hola, ¿en qué te puedo ayudar hoy? (Escribe 'salir' para terminar)")
    try:
        while True:
            pregunta = input("Tú: ").strip()
            if pregunta.lower() in {"salir", "exit", "quit"}:
                print("Asistente: ¡Hasta luego!")
                break
            respuesta = bot.buscar_servicio(pregunta)
            print(f"Asistente: {respuesta}")
    except KeyboardInterrupt:
        print("\nAsistente: ¡Hasta luego!")
    finally:
        bot.close()


if __name__ == "__main__":
    run_cli()
