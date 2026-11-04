import React, { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { listTable, updateRow, deleteRow } from "../lib/offline";
import { logoutUser } from "../lib/api";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function TailorDashboard() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [filteredMeasurements, setFilteredMeasurements] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const role = currentUser.role;

  const fetchOrders = async () => {
    try {
      const rows = await listTable("orders");
      setOrders(rows);
      setFilteredOrders(rows);
    } catch (err) {
      setError(err.message || "Failed to fetch orders");
    }
  };

  const fetchMeasurements = async () => {
    try {
      const rows = await listTable("measurements");
      setMeasurements(rows);
      setFilteredMeasurements(rows);
    } catch (err) {
      console.log(err.message || "Failed to fetch measurements");
    }
  };

  const fetchBookings = async () => {
    try {
      const rows = await listTable("bookings");
      setBookings(rows);
      setFilteredBookings(rows);
    } catch (err) {
      console.log(err.message || "Failed to fetch bookings");
    }
  };

  useEffect(() => {
    const loadAll = () => {
      fetchOrders();
      fetchMeasurements();
      fetchBookings();
    };
    loadAll();
    window.addEventListener("tailor-synced", loadAll);
    window.addEventListener("online", loadAll);
    return () => {
      window.removeEventListener("tailor-synced", loadAll);
      window.removeEventListener("online", loadAll);
    };
  }, []);

  useEffect(() => {
    const s = search.toLowerCase();

    let filteredO = orders;
    if (s) {
      filteredO = orders.filter(
        item =>
          item.name?.toLowerCase().includes(s) ||
          item.user?.name?.toLowerCase().includes(s) ||
          item.design?.toLowerCase().includes(s) ||
          item.clothType?.toLowerCase().includes(s) ||
          item.phone?.toLowerCase().includes(s) ||
          item.user?.phone?.toLowerCase().includes(s)
      );
    }
    if (statusFilter) {
      filteredO = filteredO.filter(
        item => item.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    setFilteredOrders(filteredO);

    let filteredM = measurements;
    if (s) {
      filteredM = measurements.filter(
        item =>
          item.name?.toLowerCase().includes(s) ||
          item.phone?.toLowerCase().includes(s)
      );
    }
    setFilteredMeasurements(filteredM);

    let filteredB = bookings;
    if (s) {
      filteredB = bookings.filter(
        item =>
          item.name?.toLowerCase().includes(s) ||
          item.service?.toLowerCase().includes(s) ||
          item.phone?.toLowerCase().includes(s)
      );
    }
    setFilteredBookings(filteredB);
  }, [search, statusFilter, orders, measurements, bookings]);

  const TABLES = { order: "orders", measurement: "measurements", booking: "bookings" };
  const refresh = type => {
    if (type === "order") fetchOrders();
    else if (type === "measurement") fetchMeasurements();
    else if (type === "booking") fetchBookings();
  };

  const updateStatus = async (id, status, type = "order") => {
    try {
      await updateRow(TABLES[type], id, { status });
      refresh(type);
    } catch (err) {
      toast.error(err.message || "Status update failed");
    }
  };

  const handleDelete = async (id, type = "order") => {
    try {
      await deleteRow(TABLES[type], id);
      refresh(type);
    } catch (err) {
      toast.error(err.message || "Delete failed");
    }
  };

  return (
    <DashboardLayout>
      <h2 className="text-4xl font-bold mt-12 mb-6">Tailor Dashboard</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name, design, service, phone, cloth type"
          className="border px-3 py-2 rounded-lg w-full sm:w-64"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="border px-3 py-2 rounded-lg w-full sm:w-auto"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <h3 className="text-2xl font-semibold mb-4">Orders</h3>
      <OrdersTable
        orders={filteredOrders}
        role={role}
        updateStatus={updateStatus}
        handleDelete={handleDelete}
      />

      <h3 className="text-2xl font-semibold mb-4">Measurements</h3>
      <MeasurementsTable
        measurements={filteredMeasurements}
        role={role}
        updateStatus={updateStatus}
        handleDelete={handleDelete}
      />

      <h3 className="text-2xl font-semibold mb-4">Bookings</h3>
      <BookingsTable
        bookings={filteredBookings}
        role={role}
        updateStatus={updateStatus}
        handleDelete={handleDelete}
      />
    </DashboardLayout>
  );
}

// Animated Table Row Wrapper
const AnimatedRow = ({ children }) => (
  <motion.tr
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.tr>
);

const OrdersTable = ({ orders, role, updateStatus, handleDelete }) => (
  <div className="overflow-x-auto mb-10">
    <table className="min-w-full border shadow-md rounded-xl overflow-hidden  border-collapse border border-gray-400">
      <thead className="bg-gradient-to-r from-red-500 via-black to-white text-white">
        <tr>
          <th className="py-3 px-4 text-left border border-gray-400">
            Order ID
          </th>
          <th className="py-3 px-4 text-left border border-gray-400">
            Customer
          </th>
          <th className="py-3 px-4 text-left border border-gray-400">Phone</th>
          <th className="py-3 px-4 text-left border border-gray-400">Design</th>
          <th className="py-3 px-4 text-left border border-gray-400">
            Cloth Type
          </th>
          <th className="py-3 px-4 text-left border border-gray-400">Status</th>
          <th className="py-3 px-4 text-left border border-gray-400">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white">
        {orders.map(order => {
          const status = order.status?.toLowerCase() || "pending";
          return (
            <AnimatedRow key={order._id}>
              <td className="py-3 px-4 border border-gray-400">{order._id}</td>
              <td className="py-3 px-4  border border-gray-400">
                {order.name || order.user?.name}
              </td>
              <td className="py-3 px-4  border border-gray-400">
                {order.phone || order.user?.phone}
              </td>
              <td className="py-3 px-4  border border-gray-400">
                {order.design}
              </td>
              <td className="py-3 px-4  border border-gray-400">
                {order.clothType}
              </td>
              <td className="py-3 px-4  border border-gray-400 capitalize">
                {status}
              </td>
              <td className="py-3 px-4 flex flex-wrap gap-2  border border-gray-400">
                {["tailor", "admin"].includes(role) && (
                  <>
                    {status === "pending" && (
                      <button
                        onClick={() =>
                          updateStatus(order._id, "progress", "order")
                        }
                        className="bg-yellow-500 text-white px-3 py-1 rounded"
                      >
                        Progress
                      </button>
                    )}
                    {status === "progress" && (
                      <button
                        onClick={() =>
                          updateStatus(order._id, "completed", "order")
                        }
                        className="bg-green-600 text-white px-3 py-1 rounded"
                      >
                        Complete
                      </button>
                    )}
                    {status === "completed" && (
                      <span className="text-green-700 font-bold">Done</span>
                    )}
                    <button
                      onClick={() => handleDelete(order._id, "order")}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </AnimatedRow>
          );
        })}
      </tbody>
    </table>
  </div>
);

// MeasurementsTable and BookingsTable use the same AnimatedRow wrapper
const MeasurementsTable = ({
  measurements,
  role,
  updateStatus,
  handleDelete,
}) => (
  <div className="overflow-x-auto mb-10">
    <table className="min-w-full border shadow-md rounded-xl overflow-hidden  border-collapse  border-gray-400">
      <thead className="bg-gradient-to-r from-red-500 via-black to-white text-white">
        <tr>
          <th className="py-3 px-4 text-left border border-gray-400">Name</th>
          <th className="py-3 px-4 text-left border border-gray-400">Phone</th>
          <th className="py-3 px-4 text-left border border-gray-400">Chest</th>
          <th className="py-3 px-4 text-left border border-gray-400">Waist</th>
          <th className="py-3 px-4 text-left border border-gray-400">Hips</th>
          <th className="py-3 px-4 text-left border border-gray-400">
            Shoulders
          </th>
          <th className="py-3 px-4 text-left border border-gray-400">Length</th>
          <th className="py-3 px-4 text-left border border-gray-400">Status</th>
          <th className="py-3 px-4 text-left border border-gray-400">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white">
        {measurements.map(m => {
          const status = m.status?.toLowerCase() || "pending";
          return (
            <AnimatedRow key={m._id}>
              <td className="py-3 px-4 border border-gray-400">{m.name}</td>
              <td className="py-3 px-4 border border-gray-400">{m.phone}</td>
              <td className="py-3 px-4 border border-gray-400">{m.chest}</td>
              <td className="py-3 px-4 border border-gray-400">{m.waist}</td>
              <td className="py-3 px-4 border border-gray-400">{m.hips}</td>
              <td className="py-3 px-4 border border-gray-400">
                {m.shoulders}
              </td>
              <td className="py-3 px-4 border border-gray-400">{m.length}</td>
              <td className="py-3 px-4 capitalize border border-gray-400">
                {status}
              </td>
              <td className="py-3 px-4 flex flex-wrap gap-2 border border-gray-400">
                {role === "tailor" ? (
                  <>
                    {status === "pending" && (
                      <button
                        onClick={() =>
                          updateStatus(m._id, "progress", "measurement")
                        }
                        className="bg-yellow-500 text-white px-3 py-1 rounded"
                      >
                        Progress
                      </button>
                    )}
                    {status === "progress" && (
                      <button
                        onClick={() =>
                          updateStatus(m._id, "completed", "measurement")
                        }
                        className="bg-green-600 text-white px-3 py-1 rounded"
                      >
                        Complete
                      </button>
                    )}
                    {status === "completed" && (
                      <span className="text-green-700 font-bold">Done</span>
                    )}
                    <button
                      onClick={() => handleDelete(m._id, "measurement")}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <span className="text-gray-500">Read Only</span>
                )}
              </td>
            </AnimatedRow>
          );
        })}
      </tbody>
    </table>
  </div>
);

const BookingsTable = ({ bookings, role, updateStatus, handleDelete }) => (
  <div className="overflow-x-auto mb-10">
    <table className="min-w-full border shadow-md rounded-xl overflow-hidden border-collapse  border-gray-400">
      <thead className="bg-gradient-to-r from-red-500 via-black to-white text-white">
        <tr>
          <th className="py-3 px-4 text-left border border-gray-400">
            Booking ID
          </th>
          <th className="py-3 px-4 text-left border border-gray-400">
            Customer
          </th>
          <th className="py-3 px-4 text-left border border-gray-400">Phone</th>
          <th className="py-3 px-4 text-left border border-gray-400">
            Service
          </th>
          <th className="py-3 px-4 text-left border border-gray-400">
            Cloth Type
          </th>
          <th className="py-3 px-4 text-left border border-gray-400">
            Complexity
          </th>
          <th className="py-3 px-4 text-left border border-gray-400">Rush</th>
          <th className="py-3 px-4 text-left border border-gray-400">Price</th>
          <th className="py-3 px-4 text-left border border-gray-400">Status</th>
          <th className="py-3 px-4 text-left border border-gray-400">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white">
        {bookings.map(b => {
          const status = b.status?.toLowerCase() || "pending";
          const canEdit = role === "tailor" || role === "admin";
          return (
            <AnimatedRow key={b._id}>
              <td className="py-3 px-4 border border-gray-400">{b._id}</td>
              <td className="py-3 px-4 border border-gray-400">{b.name}</td>
              <td className="py-3 px-4 border border-gray-400">{b.phone}</td>
              <td className="py-3 px-4 border border-gray-400">{b.service}</td>
              <td className="py-3 px-4 border border-gray-400">
                {b.clothType}
              </td>
              <td className="py-3 px-4 border border-gray-400">
                {b.complexity}
              </td>
              <td className="py-3 px-4 border border-gray-400">
                {b.rush ? "Yes" : "No"}
              </td>
              <td className="py-3 px-4 border border-gray-400">
                ${b.totalPrice}
              </td>
              <td className="py-3 px-4 capitalize border border-gray-400">
                {status}
              </td>
              <td className="py-3 px-4 flex flex-wrap gap-2 border border-gray-400">
                {canEdit ? (
                  <>
                    {status === "pending" && (
                      <button
                        onClick={() =>
                          updateStatus(b._id, "progress", "booking")
                        }
                        className="bg-yellow-500 text-white px-3 py-1 rounded"
                      >
                        Progress
                      </button>
                    )}
                    {status === "progress" && (
                      <button
                        onClick={() =>
                          updateStatus(b._id, "completed", "booking")
                        }
                        className="bg-green-600 text-white px-3 py-1 rounded"
                      >
                        Complete
                      </button>
                    )}
                    {status === "completed" && (
                      <span className="text-green-700 font-bold">Done</span>
                    )}
                    <button
                      onClick={() => handleDelete(b._id, "booking")}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <span className="text-gray-500">Read Only</span>
                )}
              </td>
            </AnimatedRow>
          );
        })}
      </tbody>
    </table>
  </div>
);

// import React, { useEffect, useState } from "react";
// import DashboardLayout from "../layouts/DashboardLayout";
// import axios from "axios";
// import { motion } from "framer-motion";
// import toast from "react-hot-toast";

// export default function TailorDashboard() {
//   const [orders, setOrders] = useState([]);
//   const [filteredOrders, setFilteredOrders] = useState([]);
//   const [measurements, setMeasurements] = useState([]);
//   const [filteredMeasurements, setFilteredMeasurements] = useState([]);
//   const [bookings, setBookings] = useState([]);
//   const [filteredBookings, setFilteredBookings] = useState([]);
//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("");
//   const [error, setError] = useState("");

//   const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
//   const role = currentUser.role;

//   const fetchOrders = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const res = await axios.get("http://localhost:4000/orders", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setOrders(res.data);
//       setFilteredOrders(res.data);
//     } catch (err) {
//       setError(err.message || "Failed to fetch orders");
//     }
//   };

//   const fetchMeasurements = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const res = await axios.get("http://localhost:4000/measurement", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setMeasurements(res.data);
//       setFilteredMeasurements(res.data);
//     } catch (err) {
//       console.log(
//         err.message || "Failed to fetch measurements"
//       );
//     }
//   };

//   const fetchBookings = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const res = await axios.get("http://localhost:4000/api/bookings", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setBookings(res.data);
//       setFilteredBookings(res.data);
//     } catch (err) {
//       console.log(err.message || "Failed to fetch bookings");
//     }
//   };

//   useEffect(() => {
//     fetchOrders();
//     fetchMeasurements();
//     fetchBookings();
//   }, []);

//   useEffect(() => {
//     const s = search.toLowerCase();

//     let filteredO = orders;
//     if (s) {
//       filteredO = orders.filter(
//         item =>
//           item.name?.toLowerCase().includes(s) ||
//           item.user?.name?.toLowerCase().includes(s) ||
//           item.design?.toLowerCase().includes(s) ||
//           item.clothType?.toLowerCase().includes(s) ||
//           item.phone?.toLowerCase().includes(s) ||
//           item.user?.phone?.toLowerCase().includes(s)
//       );
//     }
//     if (statusFilter) {
//       filteredO = filteredO.filter(
//         item => item.status?.toLowerCase() === statusFilter.toLowerCase()
//       );
//     }
//     setFilteredOrders(filteredO);

//     let filteredM = measurements;
//     if (s) {
//       filteredM = measurements.filter(
//         item =>
//           item.name?.toLowerCase().includes(s) ||
//           item.phone?.toLowerCase().includes(s)
//       );
//     }
//     setFilteredMeasurements(filteredM);

//     let filteredB = bookings;
//     if (s) {
//       filteredB = bookings.filter(
//         item =>
//           item.name?.toLowerCase().includes(s) ||
//           item.service?.toLowerCase().includes(s) ||
//           item.phone?.toLowerCase().includes(s)
//       );
//     }
//     setFilteredBookings(filteredB);
//   }, [search, statusFilter, orders, measurements, bookings]);

//   const updateStatus = async (id, status, type = "order") => {
//     try {
//       const token = localStorage.getItem("token");
//       let url;
//       if (type === "order") url = `http://localhost:4000/orders/status/${id}`;
//       else if (type === "measurement")
//         url = `http://localhost:4000/measurement/status/${id}`;
//       else if (type === "booking")
//         url = `http://localhost:4000/api/bookings/status/${id}`;

//       await axios.put(
//         url,
//         { status },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (type === "order") fetchOrders();
//       else if (type === "measurement") fetchMeasurements();
//       else if (type === "booking") fetchBookings();
//     } catch (err) {
//       toast.error(err.message || "Status update failed");
//     }
//   };

//   const handleDelete = async (id, type = "order") => {
//     try {
//       const token = localStorage.getItem("token");
//       let url;
//       if (type === "order") url = `http://localhost:4000/orders/${id}`;
//       else if (type === "measurement")
//         url = `http://localhost:4000/measurement/${id}`;
//       else if (type === "booking")
//         url = `http://localhost:4000/api/bookings/${id}`;

//       await axios.delete(url, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (type === "order") fetchOrders();
//       else if (type === "measurement") fetchMeasurements();
//       else if (type === "booking") fetchBookings();
//     } catch (err) {
//       toast.error(err.message || "Delete failed");
//     }
//   };

//   return (
//     <DashboardLayout>
//       <h2 className="text-4xl font-bold mt-12 mb-6">Tailor Dashboard</h2>
//       {error && <p className="text-red-500 mb-4">{error}</p>}

//       <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
//         <input
//           type="text"
//           placeholder="Search by name, design, service, phone, cloth type"
//           className="border px-3 py-2 rounded-lg w-full sm:w-64"
//           value={search}
//           onChange={e => setSearch(e.target.value)}
//         />
//         <select
//           className="border px-3 py-2 rounded-lg w-full sm:w-auto"
//           value={statusFilter}
//           onChange={e => setStatusFilter(e.target.value)}
//         >
//           <option value="">All</option>
//           <option value="pending">Pending</option>
//           <option value="progress">In Progress</option>
//           <option value="completed">Completed</option>
//         </select>
//       </div>

//       <h3 className="text-2xl font-semibold mb-4">Orders</h3>
//       <OrdersTable
//         orders={filteredOrders}
//         role={role}
//         updateStatus={updateStatus}
//         handleDelete={handleDelete}
//       />

//       <h3 className="text-2xl font-semibold mb-4">Measurements</h3>
//       <MeasurementsTable
//         measurements={filteredMeasurements}
//         role={role}
//         updateStatus={updateStatus}
//         handleDelete={handleDelete}
//       />

//       <h3 className="text-2xl font-semibold mb-4">Bookings</h3>
//       <BookingsTable
//         bookings={filteredBookings}
//         role={role}
//         updateStatus={updateStatus}
//         handleDelete={handleDelete}
//       />
//     </DashboardLayout>
//   );
// }

// // Animated Table Row Wrapper
// const AnimatedRow = ({ children }) => (
//   <motion.tr
//     initial={{ opacity: 0, y: 20 }}
//     animate={{ opacity: 1, y: 0 }}
//     exit={{ opacity: 0, y: 20 }}
//     transition={{ duration: 0.3 }}
//   >
//     {children}
//   </motion.tr>
// );

// const OrdersTable = ({ orders, role, updateStatus, handleDelete }) => (
//   <div className="overflow-x-auto mb-10">
//     <table className="min-w-full border shadow-md rounded-xl overflow-hidden  border-collapse border border-gray-400">
//       <thead className="bg-gradient-to-r from-red-500 via-black to-white text-white">
//         <tr>
//           <th className="py-3 px-4 text-left border border-gray-400">
//             Order ID
//           </th>
//           <th className="py-3 px-4 text-left border border-gray-400">
//             Customer
//           </th>
//           <th className="py-3 px-4 text-left border border-gray-400">Phone</th>
//           <th className="py-3 px-4 text-left border border-gray-400">Design</th>
//           <th className="py-3 px-4 text-left border border-gray-400">
//             Cloth Type
//           </th>
//           <th className="py-3 px-4 text-left border border-gray-400">Status</th>
//           <th className="py-3 px-4 text-left border border-gray-400">
//             Actions
//           </th>
//         </tr>
//       </thead>
//       <tbody className="bg-white">
//         {orders.map(order => {
//           const status = order.status?.toLowerCase() || "pending";
//           return (
//             <AnimatedRow key={order._id}>
//               <td className="py-3 px-4 border border-gray-400">{order._id}</td>
//               <td className="py-3 px-4  border border-gray-400">
//                 {order.name || order.user?.name}
//               </td>
//               <td className="py-3 px-4  border border-gray-400">
//                 {order.phone || order.user?.phone}
//               </td>
//               <td className="py-3 px-4  border border-gray-400">
//                 {order.design}
//               </td>
//               <td className="py-3 px-4  border border-gray-400">
//                 {order.clothType}
//               </td>
//               <td className="py-3 px-4  border border-gray-400 capitalize">
//                 {status}
//               </td>
//               <td className="py-3 px-4 flex flex-wrap gap-2  border border-gray-400">
//                 {["tailor", "admin"].includes(role) && (
//                   <>
//                     {status === "pending" && (
//                       <button
//                         onClick={() =>
//                           updateStatus(order._id, "progress", "order")
//                         }
//                         className="bg-yellow-500 text-white px-3 py-1 rounded"
//                       >
//                         Progress
//                       </button>
//                     )}
//                     {status === "progress" && (
//                       <button
//                         onClick={() =>
//                           updateStatus(order._id, "completed", "order")
//                         }
//                         className="bg-green-600 text-white px-3 py-1 rounded"
//                       >
//                         Complete
//                       </button>
//                     )}
//                     {status === "completed" && (
//                       <span className="text-green-700 font-bold">Done</span>
//                     )}
//                     <button
//                       onClick={() => handleDelete(order._id, "order")}
//                       className="bg-red-600 text-white px-3 py-1 rounded"
//                     >
//                       Delete
//                     </button>
//                   </>
//                 )}
//               </td>
//             </AnimatedRow>
//           );
//         })}
//       </tbody>
//     </table>
//   </div>
// );

// // MeasurementsTable and BookingsTable use the same AnimatedRow wrapper
// const MeasurementsTable = ({
//   measurements,
//   role,
//   updateStatus,
//   handleDelete,
// }) => (
//   <div className="overflow-x-auto mb-10">
//     <table className="min-w-full border shadow-md rounded-xl overflow-hidden  border-collapse  border-gray-400">
//       <thead className="bg-gradient-to-r from-red-500 via-black to-white text-white">
//         <tr>
//           <th className="py-3 px-4 text-left border border-gray-400">Name</th>
//           <th className="py-3 px-4 text-left border border-gray-400">Phone</th>
//           <th className="py-3 px-4 text-left border border-gray-400">Chest</th>
//           <th className="py-3 px-4 text-left border border-gray-400">Waist</th>
//           <th className="py-3 px-4 text-left border border-gray-400">Hips</th>
//           <th className="py-3 px-4 text-left border border-gray-400">
//             Shoulders
//           </th>
//           <th className="py-3 px-4 text-left border border-gray-400">Length</th>
//           <th className="py-3 px-4 text-left border border-gray-400">Status</th>
//           <th className="py-3 px-4 text-left border border-gray-400">
//             Actions
//           </th>
//         </tr>
//       </thead>
//       <tbody className="bg-white">
//         {measurements.map(m => {
//           const status = m.status?.toLowerCase() || "pending";
//           return (
//             <AnimatedRow key={m._id}>
//               <td className="py-3 px-4 border border-gray-400">{m.name}</td>
//               <td className="py-3 px-4 border border-gray-400">{m.phone}</td>
//               <td className="py-3 px-4 border border-gray-400">{m.chest}</td>
//               <td className="py-3 px-4 border border-gray-400">{m.waist}</td>
//               <td className="py-3 px-4 border border-gray-400">{m.hips}</td>
//               <td className="py-3 px-4 border border-gray-400">
//                 {m.shoulders}
//               </td>
//               <td className="py-3 px-4 border border-gray-400">{m.length}</td>
//               <td className="py-3 px-4 capitalize border border-gray-400">
//                 {status}
//               </td>
//               <td className="py-3 px-4 flex flex-wrap gap-2 border border-gray-400">
//                 {role === "tailor" ? (
//                   <>
//                     {status === "pending" && (
//                       <button
//                         onClick={() =>
//                           updateStatus(m._id, "progress", "measurement")
//                         }
//                         className="bg-yellow-500 text-white px-3 py-1 rounded"
//                       >
//                         Progress
//                       </button>
//                     )}
//                     {status === "progress" && (
//                       <button
//                         onClick={() =>
//                           updateStatus(m._id, "completed", "measurement")
//                         }
//                         className="bg-green-600 text-white px-3 py-1 rounded"
//                       >
//                         Complete
//                       </button>
//                     )}
//                     {status === "completed" && (
//                       <span className="text-green-700 font-bold">Done</span>
//                     )}
//                     <button
//                       onClick={() => handleDelete(m._id, "measurement")}
//                       className="bg-red-600 text-white px-3 py-1 rounded"
//                     >
//                       Delete
//                     </button>
//                   </>
//                 ) : (
//                   <span className="text-gray-500">Read Only</span>
//                 )}
//               </td>
//             </AnimatedRow>
//           );
//         })}
//       </tbody>
//     </table>
//   </div>
// );

// const BookingsTable = ({ bookings, role, updateStatus, handleDelete }) => (
//   <div className="overflow-x-auto mb-10">
//     <table className="min-w-full border shadow-md rounded-xl overflow-hidden border-collapse  border-gray-400">
//       <thead className="bg-gradient-to-r from-red-500 via-black to-white text-white">
//         <tr>
//           <th className="py-3 px-4 text-left border border-gray-400">
//             Booking ID
//           </th>
//           <th className="py-3 px-4 text-left border border-gray-400">
//             Customer
//           </th>
//           <th className="py-3 px-4 text-left border border-gray-400">Phone</th>
//           <th className="py-3 px-4 text-left border border-gray-400">
//             Service
//           </th>
//           <th className="py-3 px-4 text-left border border-gray-400">
//             Cloth Type
//           </th>
//           <th className="py-3 px-4 text-left border border-gray-400">
//             Complexity
//           </th>
//           <th className="py-3 px-4 text-left border border-gray-400">Rush</th>
//           <th className="py-3 px-4 text-left border border-gray-400">Price</th>
//           <th className="py-3 px-4 text-left border border-gray-400">Status</th>
//           <th className="py-3 px-4 text-left border border-gray-400">
//             Actions
//           </th>
//         </tr>
//       </thead>
//       <tbody className="bg-white">
//         {bookings.map(b => {
//           const status = b.status?.toLowerCase() || "pending";
//           const canEdit = role === "tailor" || role === "admin";
//           return (
//             <AnimatedRow key={b._id}>
//               <td className="py-3 px-4 border border-gray-400">{b._id}</td>
//               <td className="py-3 px-4 border border-gray-400">{b.name}</td>
//               <td className="py-3 px-4 border border-gray-400">{b.phone}</td>
//               <td className="py-3 px-4 border border-gray-400">{b.service}</td>
//               <td className="py-3 px-4 border border-gray-400">
//                 {b.clothType}
//               </td>
//               <td className="py-3 px-4 border border-gray-400">
//                 {b.complexity}
//               </td>
//               <td className="py-3 px-4 border border-gray-400">
//                 {b.rush ? "Yes" : "No"}
//               </td>
//               <td className="py-3 px-4 border border-gray-400">
//                 ${b.totalPrice}
//               </td>
//               <td className="py-3 px-4 capitalize border border-gray-400">
//                 {status}
//               </td>
//               <td className="py-3 px-4 flex flex-wrap gap-2 border border-gray-400">
//                 {canEdit ? (
//                   <>
//                     {status === "pending" && (
//                       <button
//                         onClick={() =>
//                           updateStatus(b._id, "progress", "booking")
//                         }
//                         className="bg-yellow-500 text-white px-3 py-1 rounded"
//                       >
//                         Progress
//                       </button>
//                     )}
//                     {status === "progress" && (
//                       <button
//                         onClick={() =>
//                           updateStatus(b._id, "completed", "booking")
//                         }
//                         className="bg-green-600 text-white px-3 py-1 rounded"
//                       >
//                         Complete
//                       </button>
//                     )}
//                     {status === "completed" && (
//                       <span className="text-green-700 font-bold">Done</span>
//                     )}
//                     <button
//                       onClick={() => handleDelete(b._id, "booking")}
//                       className="bg-red-600 text-white px-3 py-1 rounded"
//                     >
//                       Delete
//                     </button>
//                   </>
//                 ) : (
//                   <span className="text-gray-500">Read Only</span>
//                 )}
//               </td>
//             </AnimatedRow>
//           );
//         })}
//       </tbody>
//     </table>
//   </div>
// );
