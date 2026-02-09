import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axios";
import { toast } from "react-toastify";

const VerifyAdmins = () => {
  const navigate = useNavigate();

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchAdmins = async () => {
    try {
      const { data } = await axios.get("/superadmin/pending-admins");
      setAdmins(data);
    } catch {
      toast.error("Failed to load admin requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const approveAdmin = async (id) => {
    setProcessingId(id);
    try {
      await axios.post(`/superadmin/approve-admin/${id}`);
      toast.success("Admin approved successfully");
      fetchAdmins();
    } catch {
      toast.error("Failed to approve admin");
    } finally {
      setProcessingId(null);
    }
  };

  const rejectAdmin = async (id) => {
    if (!window.confirm("Reject this admin request?")) return;

    setProcessingId(id);
    try {
      await axios.post(`/superadmin/reject-admin/${id}`);
      toast.success("Admin request rejected");
      fetchAdmins();
    } catch {
      toast.error("Failed to reject admin");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-zinc-400">Loading admin requests...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-6 py-10">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold text-[#7A1CAC]">
            🛂 Admin Requests
          </h1>

          <button
            onClick={() => navigate("/superadmin/dashboard")}
            className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
          >
            ← Back
          </button>
        </div>

        {admins.length === 0 ? (
          <p className="text-zinc-400">
            No pending admin requests 🎉
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {admins.map((admin) => (
              <div
                key={admin._id}
                className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6"
              >
                <h2 className="text-xl font-bold text-zinc-100">
                  {admin.name}
                </h2>

                <p className="text-zinc-400 text-sm">
                  📧 {admin.email}
                </p>

                <p className="text-zinc-400 text-sm">
                  📞 {admin.phone || "—"}
                </p>

                <p className="text-zinc-300 text-sm mt-2">
                  🏷️ Club:{" "}
                  <span className="font-semibold">
                    {admin.adminVerification?.clubName || "—"}
                  </span>
                </p>

                {admin.adminVerification?.proofDocument && (
                  <a
                    href={admin.adminVerification.proofDocument}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-3 text-sm text-[#7A1CAC] hover:underline"
                  >
                    📄 View Proof Document
                  </a>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    disabled={processingId === admin._id}
                    onClick={() => approveAdmin(admin._id)}
                    className="px-4 py-2 rounded-lg bg-green-600 text-white disabled:opacity-60"
                  >
                    Approve
                  </button>

                  <button
                    disabled={processingId === admin._id}
                    onClick={() => rejectAdmin(admin._id)}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default VerifyAdmins;
