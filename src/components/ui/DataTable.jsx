// Tabla responsive: en móvil cada fila se convierte en tarjeta (usa data-label).
// columns: [{ key, label, render?, align?, className? }]
export function DataTable({ columns, rows, rowKey = 'id', empty = 'Sin registros', footer }) {
  return (
    <div className="table-wrap">
      <table className="table responsive">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={c.align === 'right' ? 'right' : ''}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr className="empty-row"><td colSpan={columns.length}>{empty}</td></tr>
          )}
          {rows.map((r, i) => (
            <tr key={r[rowKey] ?? i}>
              {columns.map((c) => (
                <td key={c.key} data-label={c.label} className={`${c.align === 'right' ? 'right' : ''} ${c.className?.(r) || ''}`}>
                  {c.render ? c.render(r) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {footer && <tfoot>{footer}</tfoot>}
      </table>
    </div>
  );
}
