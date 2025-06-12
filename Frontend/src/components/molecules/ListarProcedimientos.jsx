import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ListarProcedimientos() {
    const navigate = useNavigate();
    const [procedimientos, setProcedimientos] = useState([]);

    // Implementar lógica para obtener procedimientos desde una API o estado global
    useEffect(() => {
        // Simulación de una llamada a una API para obtener procedimientos
        setProcedimientos([
            {
                id: 1,
                nombre: "Procedimiento A",
                descripcion: "Descripción del procedimiento A",
                categoria: "Cardiología",
            },
            {
                id: 2,
                nombre: "Procedimiento B",
                descripcion: "Descripción del procedimiento B",
                categoria: "Neurología",
            },
            {
                id: 3,
                nombre: "Procedimiento C",
                descripcion: "Descripción del procedimiento C",
            },
        ]);
    }, []);

    return (
        <table className="table table-striped">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Categoria</th>
                    <th className="d-flex justify-content-between align-items-center">
                        <div>Acciones</div>
                        <div onClick={() => navigate("/procedimientos/nuevo")} className="btn btn-success">
                            <i class="nav-icon fas fa-plus"></i>
                        </div>
                    </th>
                </tr>
            </thead>
            <tbody>
                {procedimientos.map((procedimiento) => (
                    <tr key={procedimiento.id}>
                        <td>{procedimiento.id}</td>
                        <td>{procedimiento.nombre}</td>
                        <td>{procedimiento.descripcion}</td>
                        <td>{procedimiento.categoria || "General"}</td>
                        <td className="d-flex">
                            {/* Botones de acción */}
                            <div>
                                <button
                                    className="btn btn-primary w-30"
                                    onClick={() =>
                                        navigate(
                                            `/procedimientos/${procedimiento.id}`
                                        )
                                    }
                                >
                                    Editar
                                </button>
                            </div>
                            <div>
                                <button className="btn btn-danger w-30 ml-3">
                                    Eliminar
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}