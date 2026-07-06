import { useEffect, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Scan = () => {
  const [scannedData, setScannedData] = useState(null);
  const [user, setUser] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const userRole = localStorage.getItem("role");
  const sponsor =
    userRole === "sponsor" ? localStorage.getItem("username") : null;
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("username")) {
      navigate("/sign-in");
    }
  }, [navigate]);

  const fetchUserData = async (userId) => {
    if (!userId) {
      alert("Please enter or scan a valid ID.");
      return;
    }

    setIsLoading(true);
    try {
      const req = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/tlc/checkin/user/${userId}`,
        {
          headers: {
            Authorization: import.meta.env.VITE_API_SECRET,
          },
        },
      );
      const userData = req.data;
      setUser(userData.user || {});
    } catch (error) {
      console.error(error);
      alert(error || "Error fetching user data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleScan = async (data) => {
    if (data && data[0]?.rawValue) {
      const qrValue = data[0].rawValue;
      setScannedData(qrValue);
      fetchUserData(qrValue);
    }
  };

  const handleError = (error) => {
    console.error(error);
    alert("Error scanning QR code. Please try again.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const req = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/tlc/checkin/user/${e.target.id.value}`,
        {
          action: e.target.action?.value || "checkin",
          booth: sponsor,
          date: e.target.date?.value,
        },
        {
          headers: {
            Authorization: import.meta.env.VITE_API_SECRET,
          },
        },
      );
      alert(req.data.message);
    } catch (e) {
      if (e.response?.data?.message) {
        return alert(e.response.data.message);
      }
      alert(e);
    } finally {
      navigate(0);
    }
  };

  const handleSignOut = () => {
    localStorage.clear();
    navigate(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center">
          <h1 className="text-xl font-bold tracking-wide">
            ระบบบันทึกการลงทะเบียน
          </h1>
          <p className="text-sm opacity-80 mt-1">SWU TLC Check-in System</p>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {/* QR Scanner Section */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-gray-700 text-center">
              📷 สแกนคิวอาร์โค้ดผู้เข้าร่วมงาน
            </label>
            <div className="overflow-hidden rounded-xl border-4 border-gray-100 shadow-inner max-w-xs mx-auto w-full aspect-square">
              <Scanner
                onScan={handleScan}
                onError={handleError}
                sound={false}
              />
            </div>
          </div>

          {/* Manual Input Search */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-600">
              QR Code ID หรืออีเมล
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="กรอก ID หรือสแกนเพื่อตรวจสอบ"
                value={scannedData || ""}
                onChange={(e) => setScannedData(e.target.value)}
              />
              <button
                type="button"
                onClick={() => fetchUserData(scannedData)}
                disabled={isLoading || !scannedData}
                className="px-4 py-2.5 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-700 active:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm whitespace-nowrap"
              >
                {isLoading ? "กำลังโหลด..." : "ตรวจสอบ"}
              </button>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                QR Code ID
              </label>
              <input
                type="text"
                name="id"
                className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 font-mono text-sm outline-none cursor-not-allowed"
                value={user._id || ""}
                readOnly
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                ชื่อ - นามสกุล
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-medium outline-none cursor-not-allowed"
                value={
                  user._id
                    ? `${user.prefix || ""}${user.firstname || ""} ${user.lastname || ""}`
                    : ""
                }
                readOnly
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                สถาบัน
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-700 outline-none cursor-not-allowed"
                value={user.university || ""}
                readOnly
              />
            </div>

            {/* Conditional Fields based on Role */}
            {userRole === "swu" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  กิจกรรมที่เข้าร่วม
                </label>
                <select
                  required
                  name="action"
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                >
                  <option value="">-- เลือกกิจกรรม --</option>
                  <option value="9/7/2569">ลงทะเบียนวันที่ 9 ก.ค. 2569</option>
                  <option value="10/7/2569">
                    ลงทะเบียนวันที่ 10 ก.ค. 2569
                  </option>
                  <option value="workshop_1">ลงทะเบียน Workshop 1</option>
                  <option value="workshop_2">ลงทะเบียน Workshop 2</option>
                  <option value="workshop_3">ลงทะเบียน Workshop 3</option>
                </select>
              </div>
            )}

            {userRole === "sponsor" && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    ผู้สนับสนุน (บูธ)
                  </label>
                  <input
                    type="text"
                    name="booth"
                    className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-700 outline-none cursor-not-allowed"
                    value={sponsor || ""}
                    readOnly
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700">
                    วันที่เข้าบูธ
                  </label>
                  <select
                    required
                    name="date"
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  >
                    <option value="">-- เลือกวันที่ --</option>
                    <option value="9/7/2569">
                      ลงทะเบียนวันที่ 9 ก.ค. 2569
                    </option>
                    <option value="10/7/2569">
                      ลงทะเบียนวันที่ 10 ก.ค. 2569
                    </option>
                  </select>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!scannedData || !user._id}
              className="w-full h-24 mt-2 bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 text-center"
            >
              📥 ยืนยันการรับลงทะเบียน
            </button>
          </form>

          <hr className="border-gray-200" />

          {/* Navigation Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/dashboard"
              className="flex-1 bg-gray-100 text-gray-700 font-medium px-4 py-2.5 rounded-lg text-center hover:bg-gray-200 transition text-sm"
            >
              📊 ดูสถิติข้อมูล
            </Link>
            <button
              onClick={handleSignOut}
              className="flex-1 bg-red-50 text-red-600 font-medium px-4 py-2.5 rounded-lg hover:bg-red-100 transition text-sm"
            >
              ❌ ออกจากระบบ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scan;
