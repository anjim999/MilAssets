import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { HiOutlineCube, HiOutlineTrendingUp, HiOutlineTrendingDown, HiOutlineCollection, HiOutlineFire, HiOutlineX } from 'react-icons/hi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [movementDetails, setMovementDetails] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [bases, setBases] = useState([]);
  const [equipTypes, setEquipTypes] = useState([]);
  const [filters, setFilters] = useState({ base_id: '', equipment_type_id: '', start_date: '', end_date: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axiosClient.get('/bases'),
      axiosClient.get('/equipment-types'),
    ]).then(([b, e]) => { setBases(b.data); setEquipTypes(e.data); });
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filters.base_id) params.base_id = filters.base_id;
    if (filters.equipment_type_id) params.equipment_type_id = filters.equipment_type_id;
    if (filters.start_date) params.start_date = filters.start_date;
    if (filters.end_date) params.end_date = filters.end_date;
    axiosClient.get('/dashboard/summary', { params })
      .then(res => setSummary(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters]);

  const openMovementModal = () => {
    const params = {};
    if (filters.base_id) params.base_id = filters.base_id;
    if (filters.equipment_type_id) params.equipment_type_id = filters.equipment_type_id;
    if (filters.start_date) params.start_date = filters.start_date;
    if (filters.end_date) params.end_date = filters.end_date;
    axiosClient.get('/dashboard/movement-details', { params })
      .then(res => { setMovementDetails(res.data); setShowModal(true); })
      .catch(console.error);
  };

  const kpis = summary ? [
    { label: 'Opening Balance', value: summary.opening_balance, icon: HiOutlineCube, color: '#60a5fa', bg: 'rgba(59, 130, 246, 0.1)' },
    { label: 'Closing Balance', value: summary.closing_balance, icon: HiOutlineCollection, color: '#34d399', bg: 'rgba(16, 185, 129, 0.1)' },
    { label: 'Net Movement', value: summary.net_movement, icon: HiOutlineTrendingUp, color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.1)', clickable: true },
    { label: 'Assigned', value: summary.assigned, icon: HiOutlineTrendingDown, color: '#c084fc', bg: 'rgba(168, 85, 247, 0.1)' },
    { label: 'Expended', value: summary.expended, icon: HiOutlineFire, color: '#f87171', bg: 'rgba(239, 68, 68, 0.1)' },
  ] : [];

  const chartData = summary ? [
    { name: 'Purchases', value: summary.purchases },
    { name: 'Transfer In', value: summary.transfers_in },
    { name: 'Transfer Out', value: summary.transfers_out },
    { name: 'Expended', value: summary.expended },
  ] : [];

  const cardStyle = {
    background: '#111827',
    border: '1px solid #1e293b',
    borderRadius: '12px',
    padding: '24px',
  };

  const selectStyle = {
    background: '#0f172a',
    border: '1px solid #334155',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '14px',
    width: '100%',
    outline: 'none',
  };

  const thStyle = { textAlign: 'left', paddingBottom: '8px', color: '#64748b', fontSize: '12px', borderBottom: '1px solid #1e293b' };
  const tdStyle = { padding: '12px 0', borderBottom: '1px solid rgba(30, 41, 59, 0.5)', fontSize: '14px' };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>Dashboard</h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
          {user?.role === 'admin' ? 'All bases overview' : `${user?.base_name} overview`}
        </p>
      </div>

      {/* Filters */}
      <div style={{ ...cardStyle, padding: '16px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
        {user?.role === 'admin' && (
          <div style={{ flex: '1', minWidth: '140px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Base</label>
            <select value={filters.base_id} onChange={e => setFilters(f => ({...f, base_id: e.target.value}))} style={selectStyle}>
              <option value="">All Bases</option>
              {bases.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        )}
        <div style={{ flex: '1', minWidth: '140px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Equipment Type</label>
          <select value={filters.equipment_type_id} onChange={e => setFilters(f => ({...f, equipment_type_id: e.target.value}))} style={selectStyle}>
            <option value="">All Types</option>
            {equipTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div style={{ flex: '1', minWidth: '140px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Start Date</label>
          <input type="date" value={filters.start_date} onChange={e => setFilters(f => ({...f, start_date: e.target.value}))} style={selectStyle} />
        </div>
        <div style={{ flex: '1', minWidth: '140px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>End Date</label>
          <input type="date" value={filters.end_date} onChange={e => setFilters(f => ({...f, end_date: e.target.value}))} style={selectStyle} />
        </div>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#64748b' }}>Loading...</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {kpis.map((kpi, i) => (
              <div
                key={kpi.label}
                onClick={kpi.clickable ? openMovementModal : undefined}
                style={{
                  background: '#111827', border: `1px solid ${kpi.clickable ? 'rgba(245, 158, 11, 0.5)' : '#1e293b'}`,
                  borderRadius: '12px', padding: '20px', cursor: kpi.clickable ? 'pointer' : 'default',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: kpi.clickable ? '0 4px 12px rgba(245, 158, 11, 0.1)' : 'none'
                }}
                onMouseEnter={(e) => { if(kpi.clickable) e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={(e) => { if(kpi.clickable) e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{kpi.label}</span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: kpi.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <kpi.icon style={{ fontSize: '18px', color: kpi.color }} />
                  </div>
                </div>
                <p className="kpi-value" style={{ fontSize: '28px', fontWeight: 'bold', color: kpi.color, margin: 0 }}>
                  {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
                </p>
                {kpi.clickable && <p style={{ fontSize: '12px', color: 'rgba(245, 158, 11, 0.6)', marginTop: '8px', margin: 0 }}>Click for details →</p>}
              </div>
            ))}
          </div>

          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
            <div style={cardStyle}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'white', marginBottom: '16px' }}>Movement Breakdown</h3>
              <div style={{ height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#fff' }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div style={cardStyle}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'white', marginBottom: '16px' }}>Distribution</h3>
              <div style={{ height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData.filter(d => d.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={5} label={({ name, value }) => `${name}: ${value}`}>
                      {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Net Movement Modal */}
      {showModal && movementDetails && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }} onClick={() => setShowModal(false)}>
          <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '16px', width: '100%', maxWidth: '800px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #1e293b', background: '#111827' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', margin: 0 }}>Net Movement Details</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><HiOutlineX size={24} /></button>
            </div>
            <div style={{ padding: '24px', overflowY: 'auto' }}>
              {/* Purchases */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#34d399', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399' }} /> Purchases ({movementDetails.purchases.length})
                </h3>
                {movementDetails.purchases.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr>
                      <th style={thStyle}>Date</th><th style={thStyle}>Equipment</th><th style={thStyle}>Base</th><th style={{...thStyle, textAlign:'right'}}>Qty</th>
                    </tr></thead>
                    <tbody>
                      {movementDetails.purchases.map(p => (
                        <tr key={p.id}>
                          <td style={{...tdStyle, color: '#cbd5e1'}}>{p.purchase_date}</td>
                          <td style={{...tdStyle, color: 'white'}}>{p.equipment_name}</td>
                          <td style={{...tdStyle, color: '#94a3b8'}}>{p.base_name}</td>
                          <td style={{...tdStyle, color: '#34d399', fontWeight: '500', textAlign: 'right'}}>+{p.quantity.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>No purchases in this period.</p>}
              </div>

              {/* Transfers In */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#60a5fa', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#60a5fa' }} /> Transfers In ({movementDetails.transfers_in.length})
                </h3>
                {movementDetails.transfers_in.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr>
                      <th style={thStyle}>Date</th><th style={thStyle}>Equipment</th><th style={thStyle}>From → To</th><th style={{...thStyle, textAlign:'right'}}>Qty</th>
                    </tr></thead>
                    <tbody>
                      {movementDetails.transfers_in.map(t => (
                        <tr key={t.id}>
                          <td style={{...tdStyle, color: '#cbd5e1'}}>{t.transfer_date}</td>
                          <td style={{...tdStyle, color: 'white'}}>{t.equipment_name}</td>
                          <td style={{...tdStyle, color: '#94a3b8'}}>{t.from_base} → {t.to_base}</td>
                          <td style={{...tdStyle, color: '#60a5fa', fontWeight: '500', textAlign: 'right'}}>+{t.quantity.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>No transfers in during this period.</p>}
              </div>

              {/* Transfers Out */}
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#f87171', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f87171' }} /> Transfers Out ({movementDetails.transfers_out.length})
                </h3>
                {movementDetails.transfers_out.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr>
                      <th style={thStyle}>Date</th><th style={thStyle}>Equipment</th><th style={thStyle}>From → To</th><th style={{...thStyle, textAlign:'right'}}>Qty</th>
                    </tr></thead>
                    <tbody>
                      {movementDetails.transfers_out.map(t => (
                        <tr key={t.id}>
                          <td style={{...tdStyle, color: '#cbd5e1'}}>{t.transfer_date}</td>
                          <td style={{...tdStyle, color: 'white'}}>{t.equipment_name}</td>
                          <td style={{...tdStyle, color: '#94a3b8'}}>{t.from_base} → {t.to_base}</td>
                          <td style={{...tdStyle, color: '#f87171', fontWeight: '500', textAlign: 'right'}}>-{t.quantity.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>No transfers out during this period.</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
