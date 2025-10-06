'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CheckSquare, Calendar, Trash2, UserPlus } from 'lucide-react';

export default function AdminDashboardPage() {
  // ----- State -----
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTasks: 0,
    totalEvents: 0,
  });
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [creating, setCreating] = useState(false);

  // ----- Fetch Admin Stats -----
  const fetchAdminStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      setStats(data.stats);
      setUsers(data.users);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  // ----- Handle Add User -----
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      alert('Please fill all fields!');
      return;
    }
    setCreating(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        alert('User created successfully!');
        setUsers([...users, data.user]);
        setFormData({ name: '', email: '', password: '' });
      } else {
        alert(data.message || 'Failed to create user');
      }
    } catch (err) {
      console.error('Error adding user:', err);
    } finally {
      setCreating(false);
    }
  };

  // ----- Handle Delete User -----
  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setUsers(users.filter((user) => user._id !== id));
      } else {
        alert(data.message || 'Delete failed');
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // ----- UI -----
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat p-6"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.95), rgba(255,255,255,0.95)), url('/images/aaa.jpg')",
      }}
    >
      {/* Header */}
      <h1 className="text-4xl font-extrabold text-slate-800 mb-6 tracking-tight">
        Admin Dashboard
      </h1>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-transform hover:scale-[1.02]">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" /> Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-700">{stats.totalUsers}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-transform hover:scale-[1.02]">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckSquare className="h-5 w-5 mr-2 text-green-600" /> Total Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-700">{stats.totalTasks}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-transform hover:scale-[1.02]">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-purple-600" /> Total Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-700">{stats.totalEvents}</p>
          </CardContent>
        </Card>
      </div>

      {/* Create User Form */}
      <div className="mt-10">
        <Card className="hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-slate-800">
              <UserPlus className="h-5 w-5 mr-2 text-blue-700" /> Add New User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleAddUser}
              className="flex flex-col md:flex-row items-center gap-4"
            >
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border p-2 rounded-md w-full md:w-1/4"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border p-2 rounded-md w-full md:w-1/3"
              />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="border p-2 rounded-md w-full md:w-1/4"
              />
              <button
                type="submit"
                disabled={creating}
                className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
              >
                {creating ? 'Adding...' : 'Add User'}
              </button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <div className="mt-10">
        <Card className="hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-slate-800">
              <Users className="h-5 w-5 mr-2" /> Manage Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500 text-center py-6">Loading users...</p>
            ) : users.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No users found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border rounded-lg overflow-hidden">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="p-3 border">Name</th>
                      <th className="p-3 border">Email</th>
                      <th className="p-3 border">Role</th>
                      <th className="p-3 border text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr
                        key={user._id}
                        className={`${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        } hover:bg-blue-50 transition`}
                      >
                        <td className="p-3 border">{user.name}</td>
                        <td className="p-3 border">{user.email}</td>
                        <td className="p-3 border font-semibold">{user.role}</td>
                        <td className="p-3 border text-center">
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition"
                            >
                              <Trash2 className="inline h-4 w-4 mr-1" />
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
