import ListarProcedimientos from "../molecules/ListarProcedimientos";

export default function Procedimientos() {
  return (
    <div className="p-5">
      <h1 className="text-left">Procedimientos</h1>
      <p className="text-left font-small ">Aquí puedes gestionar los procedimientos médicos.</p>
      
      {/* //Tabla de Procedimientos */}
      <ListarProcedimientos />
    </div>
  );
}