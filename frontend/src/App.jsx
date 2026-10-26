import { useCallback, useEffect, useState } from "react";
import "./App.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const emptyStudent = {
  name: "",
  email: "",
  course: "",
  department: "",
  year: 1,
  phone: "",
};

export default function App() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyStudent);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const request = async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || data.error || "Request failed");
    }

    return data;
  };

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const query = search.trim()
        ? `?search=${encodeURIComponent(search.trim())}`
        : "";

      const data = await request(`/students${query}`);

      setStudents(
        Array.isArray(data)
          ? data
          : data.students || data.data || []
      );
    } catch (err) {
      setError(err.message || "Could not load students.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadStudents();
    }, 250);

    return () => clearTimeout(timer);
  }, [loadStudents]);

  const openAddModal = () => {
    setEditingId(null);
    setForm({ ...emptyStudent });
    setModalOpen(true);
    setNotice("");
  };

  const openEditModal = (student) => {
    setEditingId(student._id);
    setForm({
      name: student.name || "",
      email: student.email || "",
      course: student.course || "",
      department: student.department || "",
      year: student.year || 1,
      phone: student.phone || "",
    });
    setModalOpen(true);
    setNotice("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: name === "year" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice("");

    try {
      if (editingId) {
        await request(`/students/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
        setNotice("Student updated successfully.");
      } else {
        await request("/students", {
          method: "POST",
          body: JSON.stringify(form),
        });
        setNotice("Student added successfully.");
      }

      setModalOpen(false);
      setForm({ ...emptyStudent });
      setEditingId(null);
      await loadStudents();
    } catch (err) {
      setNotice(err.message || "Could not save student.");
    } finally {
      setSaving(false);
    }
  };

  const deleteStudent = async (student) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${student.name}?`
    );

    if (!confirmed) return;

    try {
      await request(`/students/${student._id}`, {
        method: "DELETE",
      });

      setNotice("Student deleted successfully.");
      await loadStudents();
    } catch (err) {
      setNotice(err.message || "Could not delete student.");
    }
  };

  const totalStudents = students.length;
  const departments = new Set(
    students.map((student) => student.department).filter(Boolean)
  ).size;
  const courses = new Set(
    students.map((student) => student.course).filter(Boolean)
  ).size;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">C</div>
          <div>
            <h2>CampusNest</h2>
            <span>Student Management</span>
          </div>
        </div>

        <p className="nav-label">MENU</p>

        <div className="nav-item active">
          <span>▦</span> Dashboard
        </div>

        <div className="nav-item">
          <span>♙</span> Students
        </div>

        <div className="sidebar-footer">
          <div className="profile-avatar">A</div>
          <div>
            <strong>Administrator</strong>
            <small>CampusNest Admin</small>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">CAMPUSNEST / OVERVIEW</p>
            <h1>Dashboard</h1>
            <p className="subtitle">
              Manage your students and academic records.
            </p>
          </div>

          <button className="primary-button" onClick={openAddModal}>
            + Add Student
          </button>
        </header>

        {notice && (
          <div className="notice" role="status">
            <span>{notice}</span>
            <button
              className="notice-close"
              onClick={() => setNotice("")}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
            <button onClick={loadStudents}>Retry</button>
          </div>
        )}

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">♙</div>
            <p>Total Students</p>
            <h2>{loading ? "…" : totalStudents}</h2>
            <span>Students in current list</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon blush">▤</div>
            <p>Departments</p>
            <h2>{loading ? "…" : departments}</h2>
            <span>Represented departments</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon rose">▣</div>
            <p>Courses</p>
            <h2>{loading ? "…" : courses}</h2>
            <span>Represented courses</span>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Student Directory</h2>
              <p>View and manage student information.</p>
            </div>

            <button className="secondary-button" onClick={loadStudents}>
              ↻ Refresh
            </button>
          </div>

          <div className="search-bar">
            <span>⌕</span>
            <input
              type="search"
              placeholder="Search by name, email, course..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>STUDENT</th>
                  <th>COURSE</th>
                  <th>DEPARTMENT</th>
                  <th>YEAR</th>
                  <th>PHONE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="empty-state">
                      Loading students...
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-state">
                      <div className="empty-icon">♙</div>
                      <strong>No students found</strong>
                      <p>Add a student or try another search.</p>
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student._id}>
                      <td>
                        <div className="student-cell">
                          <div className="student-avatar">
                            {(student.name || "?")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div>
                            <strong>{student.name}</strong>
                            <small>{student.email}</small>
                          </div>
                        </div>
                      </td>

                      <td>{student.course}</td>
                      <td>
                        <span className="department-badge">
                          {student.department}
                        </span>
                      </td>
                      <td>{student.year}</td>
                      <td>{student.phone || "—"}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="edit-button"
                            onClick={() => openEditModal(student)}
                            title="Edit student"
                            aria-label={`Edit ${student.name}`}
                          >
                            ✎
                          </button>
                          <button
                            className="delete-button"
                            onClick={() => deleteStudent(student)}
                            title="Delete student"
                            aria-label={`Delete ${student.name}`}
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="panel-footer">
            Showing {loading ? "…" : students.length} student
            {students.length === 1 ? "" : "s"}
          </div>
        </section>

        <footer className="page-footer">
          © {new Date().getFullYear()} CampusNest · Student Management System
        </footer>
      </main>

      {modalOpen && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setModalOpen(false);
            }
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="modal-header">
              <div>
                <p className="eyebrow">STUDENT RECORD</p>
                <h2 id="modal-title">
                  {editingId ? "Edit Student" : "Add New Student"}
                </h2>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => setModalOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <label>
                  Full Name *
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    required
                  />
                </label>

                <label>
                  Email Address *
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="student@example.com"
                    required
                  />
                </label>

                <label>
                  Course *
                  <input
                    name="course"
                    value={form.course}
                    onChange={handleChange}
                    placeholder="e.g. B.Tech CSE"
                    required
                  />
                </label>

                <label>
                  Department *
                  <input
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    placeholder="e.g. Computer Science"
                    required
                  />
                </label>

                <label>
                  Academic Year *
                  <select
                    name="year"
                    value={form.year}
                    onChange={handleChange}
                    required
                  >
                    {[1, 2, 3, 4, 5, 6].map((year) => (
                      <option key={year} value={year}>
                        Year {year}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Phone Number
                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Save Changes"
                    : "Add Student"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}