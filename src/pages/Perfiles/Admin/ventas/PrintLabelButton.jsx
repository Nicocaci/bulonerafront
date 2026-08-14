import axiosInstance from "../../../../utils/axiosConfig.js";
import Swal from "sweetalert2";

export default function PrintLabelButton({ envioId }) {
  const handlePrint = async () => {
    try {
      const response = await axiosInstance.get(`/api/shipping/shipments/${envioId}/label`, {
        responseType: "blob", // 👈 importante también del lado del navegador
      });

      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `etiqueta-${envioId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error al descargar etiqueta:", err);
      Swal.fire({
        icon: "error",
        title: "No se pudo generar la etiqueta",
        text: "El envío puede no estar listo todavía para imprimir.",
      });
    }
  };

  return (
    <button onClick={handlePrint} className="admin-btn-secondary">
      🖨️ Imprimir etiqueta
    </button>
  );
}