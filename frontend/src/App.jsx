
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { LayoutDashboard, PlusCircle, Star, Pencil, Trash2, MessageSquare, BookOpen } from "lucide-react";
import "./App.css";

const API = "http://localhost:5000/api/feedback";

function Dashboard() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  async function load() {
    try {
      const response = await axios.get(API);
      setItems(response.data);
      setError("");
    } catch {
      setError("Cannot connect to the backend. Check that the server is running and MongoDB is configured.");
    }
  }

  useEffect(() => { load(); }, []);

  async function remove(id) {
    if (!window.confirm("Delete this feedback?")) return;
    try {
      await axios.delete(`${API}/${id}`);
      load();
    } catch {
      alert("Could not delete feedback.");
    }
  }

  const average = items.length
    ? (items.reduce((sum, item) => sum + Number(item.rating), 0) / items.length).toFixed(1)
    : "0.0";

  return (
    <main className="page">
      <div className="page-heading">
        <div><p className="eyebrow">OVERVIEW</p><h1>Feedback Dashboard</h1><p className="muted">Track course feedback and learner satisfaction.</p></div>
        <Link className="primary-btn" to="/add"><PlusCircle size={18} /> Add Feedback</Link>
      </div>
      {error && <p className="error">{error}</p>}
      <section className="stats">
        <div className="stat-card"><span>Total Feedback</span><strong>{items.length}</strong><MessageSquare /></div>
        <div className="stat-card"><span>Courses Reviewed</span><strong>{new Set(items.map(i => i.courseName)).size}</strong><BookOpen /></div>
        <div className="stat-card"><span>Average Rating</span><strong>{average} / 5</strong><Star /></div>
      </section>
      <section className="table-card">
        <div className="table-title"><div><h2>Course Feedback</h2><p className="muted">All submitted course reviews</p></div><span className="count">{items.length} records</span></div>
        <div className="table-wrap"><table><thead><tr><th>Course ID</th><th>Course Name</th><th>Duration</th><th>Feedback</th><th>Rating</th><th>Actions</th></tr></thead>
          <tbody>{items.map(item => <tr key={item._id}>
            <td className="id-cell">{item._id.slice(-6).toUpperCase()}</td>
            <td><strong>{item.courseName}</strong></td><td>{item.courseDuration}</td>
            <td className="comments">{item.comments}</td>
            <td><span className="rating"><Star size={15} fill="currentColor" /> {item.rating}/5</span></td>
            <td><div className="actions"><Link className="icon-btn edit" title="Edit" to={`/edit/${item._id}`}><Pencil size={17}/></Link><button className="icon-btn delete" title="Delete" onClick={() => remove(item._id)}><Trash2 size={17}/></button></div></td>
          </tr>)}
          {!items.length && <tr><td colSpan="6" className="empty">{error ? "Backend unavailable." : "No feedback yet. Add your first course review!"}</td></tr>}
          </tbody></table></div>
      </section>
    </main>
  );
}

function FeedbackForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const [form, setForm] = useState({ courseName: "", courseDuration: "", comments: "", rating: "5" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (editing) axios.get(API).then(r => {
      const item = r.data.find(x => x._id === id);
      if (item) setForm({ courseName: item.courseName, courseDuration: item.courseDuration, comments: item.comments, rating: String(item.rating) });
      else setError("Feedback record not found.");
    }).catch(() => setError("Could not load feedback."));
  }, [id, editing]);

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      if (editing) await axios.put(`${API}/${id}`, { ...form, rating: Number(form.rating) });
      else await axios.post(API, { ...form, rating: Number(form.rating) });
      navigate("/");
    } catch {
      setError("Unable to save. Check the backend, database, and form fields.");
    }
  }

  return <main className="page form-page">
    <div className="page-heading"><div><p className="eyebrow">{editing ? "UPDATE RECORD" : "NEW ENTRY"}</p><h1>{editing ? "Edit Feedback" : "Add Course Feedback"}</h1><p className="muted">Share the details of the learner's course experience.</p></div></div>
    <form className="feedback-form" onSubmit={submit}>
      {error && <p className="error">{error}</p>}
      <label>Course Name<input name="courseName" value={form.courseName} onChange={change} placeholder="e.g. Full Stack Development" required /></label>
      <label>Course Duration<input name="courseDuration" value={form.courseDuration} onChange={change} placeholder="e.g. 12 weeks" required /></label>
      <label>Feedback Comments<textarea name="comments" value={form.comments} onChange={change} placeholder="Write the learner's feedback..." rows="5" required /></label>
      <label>Feedback Rating<select name="rating" value={form.rating} onChange={change} required>{[5,4,3,2,1].map(n => <option key={n} value={n}>{n} {n === 1 ? "star" : "stars"}</option>)}</select></label>
      <div className="form-actions"><Link className="secondary-btn" to="/">Cancel</Link><button className="primary-btn" type="submit">{editing ? "Save Changes" : "Submit Feedback"}</button></div>
    </form>
  </main>;
}

function AppLayout() {
  return <div className="app-shell"><aside className="sidebar">
    <Link className="brand" to="/"><span className="brand-icon"><MessageSquare /></span><span>Feed<span className="brand-accent">Track</span><small>ADMIN CONSOLE</small></span></Link>
    <p className="nav-label">WORKSPACE</p>
    <Link className="nav-link" to="/"><LayoutDashboard size={19}/> Dashboard</Link>
    <Link className="nav-link" to="/add"><PlusCircle size={19}/> Add Feedback</Link>
    <div className="sidebar-bottom"><div className="avatar">FA</div><div><strong>Admin Panel</strong><small>Feedback Manager</small></div></div>
  </aside><section className="main-area"><header className="topbar"><span>Course Feedback Management</span><span className="status-dot">● System Workspace</span></header>
    <Routes><Route path="/" element={<Dashboard/>}/><Route path="/add" element={<FeedbackForm/>}/><Route path="/edit/:id" element={<FeedbackForm/>}/></Routes>
    <footer>FeedTrack · Course Feedback Admin Panel</footer>
  </section></div>;
}

export default function App() {
  return <BrowserRouter><AppLayout/></BrowserRouter>;
}
