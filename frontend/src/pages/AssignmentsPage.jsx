import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { HiOutlinePlus, HiOutlineX, HiOutlineCheckCircle } from 'react-icons/hi';

export default function AssignmentsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('assignments');
  const [assignments, setAssignments] = useState([]);
  const [expenditures, setExpenditures] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipTypes, setEquipTypes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [assignForm, setAssignForm] = useState({ base_id: '', equipment_type_id: '', assigned_to: '', quantity: '', assignment_date: '', notes: '' });
  const [expendForm, setExpendForm] = useState({ base_id: '', equipment_type_id: '', quantity: '', expenditure_date: '', reason: '', notes: '' });

  useEffect(() => {
    Promise.all([axiosClient.get('/bases'), axiosClient.get('/equipment-types')])
      .then(([b, e]) => { setBases(b.data); setEquipTypes(e.data); });
  }, []);

  const fetchData = () => {
    setLoading(true);
    if (tab === 'assignments') {
      axiosClient.get('/assignments').then(r => setAssignments(r.data)).finally(() => setLoading(false));
    } else {
      axiosClient.get('/expenditures').then(r => setExpenditures(r.data)).finally(() => setLoading(false));
    }
  };

  useEffect(() => { fetchData(); }, [tab]);

  const handleReturn = async (id) => {
    if (!confirm('Mark this assignment as returned?')) return;
    await axiosClient.put(`/assignments/${id}/return`);
    fetchData();
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axiosClient.post('/assignments', { ...assignForm, base_id: Number(assignForm.base_id), equipment_type_id: Number(assignForm.equipment_type_id), quantity: Number(assignForm.quantity) });
      setShowForm(false);
      setAssignForm({ base_id: '', equipment_type_id: '', assigned_to: '', quantity: '', assignment_date: '', notes: '' });
      fetchData();
    } catch (err) { alert(err.response?.data?.error || 'Error'); }
    finally { setSubmitting(false); }
  };

  const handleExpendSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axiosClient.post('/expenditures', { ...expendForm, base_id: Number(expendForm.base_id), equipment_type_id: Number(expendForm.equipment_type_id), quantity: Number(expendForm.quantity) });
      setShowForm(false);
      setExpendForm({ base_id: '', equipment_type_id: '', quantity: '', expenditure_date: '', reason: '', notes: '' });
      fetchData();
    } catch (err) { alert(err.response?.data?.error || 'Error'); }
    finally { setSubmitting(false); }
  };

  const canCreate = user?.role === 'admin' || user?.role === 'base_commander';
  const canCreateExpend = user?.role === 'admin' || user?.role === 'base_commander';

  const cardStyle = { background: '#111827', border: '1px solid #1e293b', borderRadius: '12px' };
  const inputStyle = { background: '#0f172a', border: '1px solid #334155', color: 'white', padding: '8px 12px', borderRadius: '8px', fontSize: '14px', width: '100%', outline: 'none' };
  const btnStyle = { display: 'flex', alignItems: 'center', gap: '8px', background: '#10b981', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' };
  const thStyle = { textAlign: 'left', padding: '12px 16px', color: '#64748b', fontSize: '12px', borderBottom: '1px solid #1e293b', textTransform: 'uppercase' };
  const tdStyle = { padding: '12px 16px', borderBottom: '1px solid rgba(30, 41, 59, 0.5)', fontSize: '14px' };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', margin: 0 }}>Assignments & Expenditures</h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0' }}>Manage asset assignments and track expenditures</p>
        </div>
        {((tab === 'assignments' && canCreate) || (tab === 'expenditures' && canCreateExpend)) && (
          <button onClick={() => setShowForm(true)} style={btnStyle}>
            <HiOutlinePlus /> {tab === 'assignments' ? 'New Assignment' : 'Record Expenditure'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', background: '#111827', padding: '4px', borderRadius: '12px', border: '1px solid #1e293b', width: 'max-content', marginBottom: '24px' }}>
        <button onClick={() => setTab('assignments')} style={{
          padding: '10px 20px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '500', cursor: 'pointer',
          background: tab === 'assignments' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
          color: tab === 'assignments' ? '#34d399' : '#94a3b8',
          transition: 'all 0.2s'
        }}>
          Assignments
        </button>
        <button onClick={() => setTab('expenditures')} style={{
          padding: '10px 20px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '500', cursor: 'pointer',
          background: tab === 'expenditures' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
          color: tab === 'expenditures' ? '#f87171' : '#94a3b8',
          transition: 'all 0.2s'
        }}>
          Expenditures
        </button>
      </div>

      {/* Assignments Table */}
      {tab === 'assignments' && (
        <div style={{ ...cardStyle, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Equipment</th>
                <th style={thStyle}>Assigned To</th>
                <th style={thStyle}>Base</th>
                <th style={{...thStyle, textAlign: 'right'}}>Qty</th>
                <th style={{...thStyle, textAlign: 'center'}}>Status</th>
                {canCreate && <th style={{...thStyle, textAlign: 'center'}}>Action</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading...</td></tr>
              ) : assignments.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No assignments found</td></tr>
              ) : assignments.map(a => (
                <tr key={a.id} style={{ transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(30, 41, 59, 0.3)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ ...tdStyle, color: '#cbd5e1' }}>{a.assignment_date}</td>
                  <td style={{ ...tdStyle, color: 'white', fontWeight: '500' }}>{a.equipment_name}</td>
                  <td style={{ ...tdStyle, color: '#cbd5e1' }}>{a.assigned_to}</td>
                  <td style={{ ...tdStyle, color: '#94a3b8' }}>{a.base_name}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', color: '#c084fc', fontWeight: '600' }}>{a.quantity}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <span style={{ 
                      fontSize: '12px', padding: '4px 10px', borderRadius: '999px',
                      background: a.status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                      color: a.status === 'active' ? '#34d399' : '#94a3b8'
                    }}>
                      {a.status}
                    </span>
                  </td>
                  {canCreate && (
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      {a.status === 'active' && (
                        <button onClick={() => handleReturn(a.id)} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', margin: '0 auto', fontSize: '12px' }}>
                          <HiOutlineCheckCircle /> Return
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Expenditures Table */}
      {tab === 'expenditures' && (
        <div style={{ ...cardStyle, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Equipment</th>
                <th style={thStyle}>Base</th>
                <th style={{...thStyle, textAlign: 'right'}}>Qty</th>
                <th style={thStyle}>Reason</th>
                <th style={thStyle}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading...</td></tr>
              ) : expenditures.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No expenditures found</td></tr>
              ) : expenditures.map(ex => (
                <tr key={ex.id} style={{ transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(30, 41, 59, 0.3)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ ...tdStyle, color: '#cbd5e1' }}>{ex.expenditure_date}</td>
                  <td style={{ ...tdStyle, color: 'white', fontWeight: '500' }}>{ex.equipment_name}</td>
                  <td style={{ ...tdStyle, color: '#94a3b8' }}>{ex.base_name}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', color: '#f87171', fontWeight: '600' }}>{ex.quantity.toLocaleString()}</td>
                  <td style={{ ...tdStyle, color: '#cbd5e1' }}>{ex.reason || '-'}</td>
                  <td style={{ ...tdStyle, color: '#64748b', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ex.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }} onClick={() => setShowForm(false)}>
          <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '16px', width: '100%', maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid #1e293b' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', margin: 0 }}>{tab === 'assignments' ? 'New Assignment' : 'Record Expenditure'}</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><HiOutlineX size={24} /></button>
            </div>

            {tab === 'assignments' ? (
              <form onSubmit={handleAssignSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Base *</label>
                    <select value={assignForm.base_id} onChange={e => setAssignForm(f => ({...f, base_id: e.target.value}))} required style={inputStyle}>
                      <option value="">Select</option>
                      {(user?.role === 'admin' ? bases : bases.filter(b => b.id === user?.base_id)).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Equipment *</label>
                    <select value={assignForm.equipment_type_id} onChange={e => setAssignForm(f => ({...f, equipment_type_id: e.target.value}))} required style={inputStyle}>
                      <option value="">Select</option>
                      {equipTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Assigned To (Personnel) *</label>
                  <input type="text" value={assignForm.assigned_to} onChange={e => setAssignForm(f => ({...f, assigned_to: e.target.value}))} required placeholder="e.g., Sgt. Vikram Patel" style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Quantity *</label>
                    <input type="number" min="1" value={assignForm.quantity} onChange={e => setAssignForm(f => ({...f, quantity: e.target.value}))} required style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Date *</label>
                    <input type="date" value={assignForm.assignment_date} onChange={e => setAssignForm(f => ({...f, assignment_date: e.target.value}))} required style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Notes</label>
                  <textarea value={assignForm.notes} onChange={e => setAssignForm(f => ({...f, notes: e.target.value}))} rows={2} style={{...inputStyle, resize: 'none'}} />
                </div>
                <button type="submit" disabled={submitting} style={{ ...btnStyle, width: '100%', justifyContent: 'center', marginTop: '8px', opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Saving...' : 'Create Assignment'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleExpendSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Base *</label>
                    <select value={expendForm.base_id} onChange={e => setExpendForm(f => ({...f, base_id: e.target.value}))} required style={inputStyle}>
                      <option value="">Select</option>
                      {(user?.role === 'admin' ? bases : bases.filter(b => b.id === user?.base_id)).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Equipment *</label>
                    <select value={expendForm.equipment_type_id} onChange={e => setExpendForm(f => ({...f, equipment_type_id: e.target.value}))} required style={inputStyle}>
                      <option value="">Select</option>
                      {equipTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Quantity *</label>
                    <input type="number" min="1" value={expendForm.quantity} onChange={e => setExpendForm(f => ({...f, quantity: e.target.value}))} required style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Date *</label>
                    <input type="date" value={expendForm.expenditure_date} onChange={e => setExpendForm(f => ({...f, expenditure_date: e.target.value}))} required style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Reason</label>
                  <input type="text" value={expendForm.reason} onChange={e => setExpendForm(f => ({...f, reason: e.target.value}))} placeholder="e.g., Live fire training" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Notes</label>
                  <textarea value={expendForm.notes} onChange={e => setExpendForm(f => ({...f, notes: e.target.value}))} rows={2} style={{...inputStyle, resize: 'none'}} />
                </div>
                <button type="submit" disabled={submitting} style={{ ...btnStyle, background: '#ef4444', width: '100%', justifyContent: 'center', marginTop: '8px', opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Saving...' : 'Record Expenditure'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
