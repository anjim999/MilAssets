import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { HiOutlinePlus, HiOutlineX, HiOutlineArrowRight } from 'react-icons/hi';

export default function TransfersPage() {
  const { user } = useAuth();
  const [transfers, setTransfers] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipTypes, setEquipTypes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ base_id: '', equipment_type_id: '', start_date: '', end_date: '' });
  const [form, setForm] = useState({ from_base_id: '', to_base_id: '', equipment_type_id: '', quantity: '', transfer_date: '', notes: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([axiosClient.get('/bases'), axiosClient.get('/equipment-types')])
      .then(([b, e]) => { setBases(b.data); setEquipTypes(e.data); });
  }, []);

  const fetchTransfers = () => {
    setLoading(true);
    const params = {};
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
    axiosClient.get('/transfers', { params }).then(r => setTransfers(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchTransfers(); }, [filters]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.from_base_id === form.to_base_id) { alert('Cannot transfer to the same base'); return; }
    setSubmitting(true);
    try {
      await axiosClient.post('/transfers', { ...form, from_base_id: Number(form.from_base_id), to_base_id: Number(form.to_base_id), equipment_type_id: Number(form.equipment_type_id), quantity: Number(form.quantity) });
      setShowForm(false);
      setForm({ from_base_id: '', to_base_id: '', equipment_type_id: '', quantity: '', transfer_date: '', notes: '' });
      fetchTransfers();
    } catch (err) { alert(err.response?.data?.error || 'Error creating transfer'); }
    finally { setSubmitting(false); }
  };

  const canCreate = user?.role === 'admin' || user?.role === 'base_commander' || user?.role === 'logistics_officer';
  
  const statusColors = {
    completed: { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399' },
    in_transit: { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24' },
    pending: { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa' },
    cancelled: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171' }
  };

  const cardStyle = { background: '#111827', border: '1px solid #1e293b', borderRadius: '12px' };
  const inputStyle = { background: '#0f172a', border: '1px solid #334155', color: 'white', padding: '8px 12px', borderRadius: '8px', fontSize: '14px', width: '100%', outline: 'none' };
  const btnStyle = { display: 'flex', alignItems: 'center', gap: '8px', background: '#10b981', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' };
  const thStyle = { textAlign: 'left', padding: '12px 16px', color: '#64748b', fontSize: '12px', borderBottom: '1px solid #1e293b', textTransform: 'uppercase' };
  const tdStyle = { padding: '12px 16px', borderBottom: '1px solid rgba(30, 41, 59, 0.5)', fontSize: '14px' };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', margin: 0 }}>Transfers</h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0' }}>Transfer assets between bases</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowForm(true)} style={btnStyle}>
            <HiOutlinePlus /> New Transfer
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
              <th style={thStyle}>From → To</th>
              <th style={{...thStyle, textAlign: 'right'}}>Quantity</th>
              <th style={{...thStyle, textAlign: 'center'}}>Status</th>
              <th style={thStyle}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading...</td></tr>
            ) : transfers.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No transfers found</td></tr>
            ) : transfers.map(t => (
              <tr key={t.id} style={{ transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(30, 41, 59, 0.3)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ ...tdStyle, color: '#cbd5e1' }}>{t.transfer_date}</td>
                <td style={{ ...tdStyle, color: 'white', fontWeight: '500' }}>{t.equipment_name}</td>
                <td style={tdStyle}>
                  <span style={{ color: '#94a3b8' }}>{t.from_base}</span>
                  <HiOutlineArrowRight style={{ display: 'inline', margin: '0 8px', color: '#34d399', verticalAlign: 'middle' }} />
                  <span style={{ color: 'white' }}>{t.to_base}</span>
                </td>
                <td style={{ ...tdStyle, textAlign: 'right', color: '#fbbf24', fontWeight: '600' }}>{t.quantity.toLocaleString()}</td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <span style={{ 
                    fontSize: '12px', padding: '4px 10px', borderRadius: '999px',
                    background: statusColors[t.status]?.bg || 'rgba(148, 163, 184, 0.15)',
                    color: statusColors[t.status]?.text || '#94a3b8'
                  }}>
                    {t.status}
                  </span>
                </td>
                <td style={{ ...tdStyle, color: '#64748b', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.notes || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Transfer Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }} onClick={() => setShowForm(false)}>
          <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '16px', width: '100%', maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid #1e293b' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', margin: 0 }}>New Transfer</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><HiOutlineX size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>From Base *</label>
                  <select value={form.from_base_id} onChange={e => setForm(f => ({...f, from_base_id: e.target.value}))} required style={inputStyle}>
                    <option value="">Select</option>
                    {(user?.role === 'admin' ? bases : bases.filter(b => b.id === user?.base_id)).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>To Base *</label>
                  <select value={form.to_base_id} onChange={e => setForm(f => ({...f, to_base_id: e.target.value}))} required style={inputStyle}>
                    <option value="">Select</option>
                    {bases.filter(b => String(b.id) !== form.from_base_id).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Equipment *</label>
                  <select value={form.equipment_type_id} onChange={e => setForm(f => ({...f, equipment_type_id: e.target.value}))} required style={inputStyle}>
                    <option value="">Select</option>
                    {equipTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Quantity *</label>
                  <input type="number" min="1" value={form.quantity} onChange={e => setForm(f => ({...f, quantity: e.target.value}))} required style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Transfer Date *</label>
                <input type="date" value={form.transfer_date} onChange={e => setForm(f => ({...f, transfer_date: e.target.value}))} required style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} rows={2} style={{ ...inputStyle, resize: 'none' }} />
              </div>
              <button type="submit" disabled={submitting} style={{ ...btnStyle, width: '100%', justifyContent: 'center', marginTop: '8px', opacity: submitting ? 0.7 : 1 }}>
                {submitting ? 'Processing...' : 'Create Transfer'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
