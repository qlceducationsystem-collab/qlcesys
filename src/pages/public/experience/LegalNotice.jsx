import { Modal } from '../../../components/ui/Modal.jsx';

export function LegalNotice({ open, onClose }) {
  return (
    <Modal open={open} title="Aviso importante" onClose={onClose}>
      <div className="stack legal-text">
        <p>Este sitio tiene fines exclusivamente informativos y educativos. No constituye asesoría financiera personalizada, recomendación de inversión, oferta pública ni garantía de resultados. Los activos digitales y el trading apalancado pueden implicar pérdidas significativas. Los resultados históricos o métricas públicas no garantizan resultados futuros.</p>
        <p>Las referencias a QLC describen el concepto educativo y operativo presentado en su documentación. La estructura contractual, regulatoria y operativa de QLC deberá validarse antes de cualquier lanzamiento comercial. Cada persona debe evaluar de manera independiente su situación financiera, tolerancia al riesgo, objetivos, obligaciones y marco legal aplicable, y consultar profesionales independientes cuando corresponda.</p>
        <p className="small">© Quantum Liquidity Capital · Educación Financiera</p>
      </div>
    </Modal>
  );
}
