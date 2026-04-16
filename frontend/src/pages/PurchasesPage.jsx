import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { HiOutlinePlus, HiOutlineX } from 'react-icons/hi';

export default function PurchasesPage() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipTypes, setEquipTypes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ base_id: '', equipment_type_id: '', start_date: '', end_date: '' });
  const [form, setForm] = useState({ base_id: '', equipment_type_id: '', quantity: '', unit_price: '', supplier: '', purchase_date: '', notes: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([axiosClient.get('/bases'), axiosClient.get('/equipment-types')])
      .then(([b, e]) => { setBases(b.data); setEquipTypes(e.data); });
  }, []);

  const fetchPurchases = () => {
    setLoading(true);
    const params = {};
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
    axiosClient.get('/purchases', { params }).then(r => setPurchases(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchPurchases(); }, [filters]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axiosClient.post('/purchases', { ...form, base_id: Number(form.base_id), equipment_type_id: Number(form.equipment_type_id), quantity: Number(form.quantity), unit_price: Number(form.unit_price) });
      setShowForm(false);
      setForm({ base_id: '', equipment_type_id: '', quantity: '', unit_price: '', supplier: '', purchase_date: '', notes: '' });
      fetchPurchases();
    } catch (err) { alert(err.response?.data?.error || 'Error creating purchase'); }
    finally { setSubmitting(false); }
  };

  const canCreate = user?.role === 'admin' || user?.role === 'base_commander' || user?.role === 'logistics_officer';

  const cardStyle = { background: '#111827', border: '1px solid #1e293b', borderRadius: '12px' };
  const inputStyle = { background: '#0f172a', border: '1px solid #334155', color: 'white', padding: '8px 12px', borderRadius: '8px', fontSize: '14px', width: '100%', outline: 'none' };
  const btnStyle = { display: 'flex', alignItems: 'center', gap: '8px', background: '#10b981', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' };
  const thStyle = { textAlign: 'left', padding: '12px 16px', color: '#64748b', fontSize: '12px', borderBottom: '1px solid #1e293b', textTransform: 'uppercase' };
  const tdStyle = { padding: '12px 16px', borderBottom: '1px solid rgba(30, 41, 59, 0.5)', fontSize: '14px' };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', margin: 0 }}>Purchases</h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0' }}>Record and view asset purchases</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowForm(true)} style={btnStyle}>
            <HiOutlinePlus /> New Purchase
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ ...cardStyle, padding: '16px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        {user?.role === 'admin' && (
          <select value={filters.base_id} onChange={e => setFilters(f => ({...f, base_id: e.target.value}))} style={inputStyle}>
            <option value="">All Bases</option>
            {bases.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}
        <select value={filters.equipment_type_id} onChange={e => setFilters(f => ({...f, equipment_type_id: e.target.value}))} style={inputStyle}>
          <option value="">All Equipment</option>
          {equipTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <input type="date" value={filters.start_date} onChange={e => setFilters(f => ({...f, start_date: e.target.value}))} style={inputStyle} />
        <input type="date" value={filters.end_date} onChange={e => setFilters(f => ({...f, end_date: e.target.value}))} style={inputStyle} />
      </div>

      {/* Table */}
      <div style={{ ...cardStyle, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead>
            <tr>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Equipment</th>
              <th style={thStyle}>Category</th>
              <th style={thStyle}>Base</th>
              <th style={{...thStyle, textAlign: 'right'}}>Quantity</th>
              <th style={thStyle}>Supplier</th>
              <th style={{...thStyle, textAlign: 'right'}}>Unit Price</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading...</td></tr>
            ) : purchases.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No purchases found</td></tr>
            ) : purchases.map(p => (
              <tr key={p.id} style={{ transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(30, 41, 59, 0.3)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ ...tdStyle, color: '#cbd5e1' }}>{p.purchase_date}</td>
                <td style={{ ...tdStyle, color: 'white', fontWeight: '500' }}>{p.equipment_name}</td>
                <td style={tdStyle}>
                  <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '999px',
                    background: p.category === 'weapon' ? 'rgba(239, 68, 68, 0.15)' : p.category === 'vehicle' ? 'rgba(59, 130, 246, 0.15)' : p.category === 'ammunition' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                    color: p.category === 'weapon' ? '#f87171' : p.category === 'vehicle' ? '#60a5fa' : p.category === 'ammunition' ? '#fbbf24' : '#c084fc'
                  }}>
                    {p.category}
                  </span>
                </td>
                <td style={{ ...tdStyle, color: '#94a3b8' }}>{p.base_name}</td>
                <td style={{ ...tdStyle, textAlign: 'right', color: '#34d399', fontWeight: '600' }}>{p.quantity.toLocaleString()}</td>
                <td style={{ ...tdStyle, color: '#94a3b8' }}>{p.supplier || '-'}</td>
                <td style={{ ...tdStyle, textAlign: 'right', color: '#cbd5e1' }}>₹{Number(p.unit_price).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Purchase Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }} onClick={() => setShowForm(false)}>
          <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '16px', width: '100%', maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid #1e293b' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', margin: 0 }}>Record Purchase</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><HiOutlineX size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Base *</label>
                  <select value={form.base_id} onChange={e => setForm(f => ({...f, base_id: e.target.value}))} required style={inputStyle}>
                    <option value="">Select Base</option>
                    {(user?.role === 'admin' ? bases : bases.filter(b => b.id === user?.base_id)).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Equipment *</label>
                  <select value={form.equipment_type_id} onChange={e => setForm(f => ({...f, equipment_type_id: e.target.value}))} required style={inputStyle}>
                    <option value="">Select Equipment</option>
                    {equipTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Quantity *</label>
                  <input type="number" min="1" value={form.quantity} onChange={e => setForm(f => ({...f, quantity: e.target.value}))} required style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Unit Price</label>
                  <input type="number" min="0" step="0.01" value={form.unit_price} onChange={e => setForm(f => ({...f, unit_price: e.target.value}))} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Purchase Date *</label>
                  <input type="date" value={form.purchase_date} onChange={e => setForm(f => ({...f, purchase_date: e.target.value}))} required style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Supplier</label>
                  <input type="text" value={form.supplier} onChange={e => setForm(f => ({...f, supplier: e.target.value}))} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} rows={2} style={{ ...inputStyle, resize: 'none' }} />
              </div>
              <button type="submit" disabled={submitting} style={{ ...btnStyle, width: '100%', justifyContent: 'center', marginTop: '8px', opacity: submitting ? 0.7 : 1 }}>
                {submitting ? 'Saving...' : 'Record Purchase'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
