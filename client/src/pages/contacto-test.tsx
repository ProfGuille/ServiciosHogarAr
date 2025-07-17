export default function ContactoTest() {
  return (
    <div style={{ padding: "50px", backgroundColor: "white", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "36px", color: "black", marginBottom: "20px" }}>Test: Página de Contacto</h1>
      <p style={{ fontSize: "18px", color: "gray" }}>Si puedes ver este texto, el enrutamiento está funcionando.</p>
      <form style={{ marginTop: "30px", maxWidth: "500px" }}>
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Nombre:</label>
          <input type="text" style={{ width: "100%", padding: "10px", border: "1px solid #ccc" }} />
        </div>
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Email:</label>
          <input type="email" style={{ width: "100%", padding: "10px", border: "1px solid #ccc" }} />
        </div>
        <button type="submit" style={{ padding: "10px 20px", backgroundColor: "#007bff", color: "white", border: "none", cursor: "pointer" }}>
          Enviar
        </button>
      </form>
    </div>
  );
}