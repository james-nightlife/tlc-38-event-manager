import { useEffect, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaStamp } from "react-icons/fa";



const KEY_SECRET = "4vEt0K0hhMcUDd6soUUJTm2K";


const Search = () => {
  const { date } = useParams();

  const dateNow = new Date();
  let dateFormatted = dateNow.toLocaleDateString("th-TH", {
    calendar: "buddhist",
  });

  dateFormatted = date === '9' ? '9/7/2569' : date === '10' ? '10/7/2569' : dateFormatted; // Hardcoded date for testing purposes

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
            Authorization: KEY_SECRET,
          },
        },
      );
      const userData = req.data;
      setUser(userData.user || {});
    } catch (error) {
      if (error.response?.data?.message) {
        return alert(error.response.data.message);
      }
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
      const dataAction = e.nativeEvent.submitter.dataset.action;

      const req = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/tlc/checkin/user/${e.target.id.value}`,
        {
          action: dataAction ?? dateFormatted, // date registration action,
          booth: e.target.booth?.value, // booth name
          date: dateFormatted, // registration date
        },
        {
          headers: {
            Authorization: KEY_SECRET,
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
      {/* ปรับขนาด max-w-md เป็น md:max-w-4xl สำหรับ iPad (หน้าจอขนาด md ขึ้นไป) 
        เพื่อรองรับการแสดงผลแบบ 2 คอลัมน์
      */}
      <div className="w-full max-w-md md:max-w-4xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300">
        {/* Header Section: ซ่อนบนมือถือ (hidden) และแสดงบน iPad ขึ้นไป (sm:block หรือ md:block) */}
        <div className="hidden sm:block bg-linear-to-r from-blue-600 to-indigo-600 p-6 text-white text-center">
          <h1 className="text-xl font-bold tracking-wide">
            ระบบบันทึกการลงทะเบียน {dateFormatted}
          </h1>
          <p className="text-sm opacity-80 mt-1">SWU TLC Check-in System</p>
        </div>

        {/* Main Container: ปรับเป็น Grid 2 คอลัมน์เมื่ออยู่บน iPad (md:grid md:grid-cols-2)
          หากอยู่บนมือถือจะเรียงเป็นคอลัมน์เดียวตามปกติ
        */}
        <div className="p-6 grid grid-cols-1 gap-6 items-start">
          {/* ================= ซีกซ้าย (บน iPad) / ส่วนบน (บนมือถือ) ================= */}
          <div className="flex flex-col gap-6">
            {/* QR Scanner Section */}

            {/*
            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-gray-700 text-center">
                📷 สแกนคิวอาร์โค้ดผู้เข้าร่วมงาน
              </label>
              {
              // ปรับขนาดกล้องให้ยืดหยุ่นเต็มพื้นที่ฝั่งซ้ายเมื่ออยู่บน iPad
              }
              <div className="overflow-hidden rounded-xl border-4 border-gray-100 shadow-inner max-w-xs md:max-w-none mx-auto w-full aspect-square">
                <Scanner
                  onScan={handleScan}
                  onError={handleError}
                  sound={false}
                />
              </div>
            </div>
            */}
            {/* Manual Input Search */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-600">
                QR Code ID หรืออีเมล หรือเลขลำดับผู้เข้าร่วมงาน
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
                  {isLoading ? "กำลังโหลด..." : "ค้นหา"}
                </button>
              </div>
            </div>

            {/* ซ่อนเส้นคั่นนี้เมื่ออยู่บน iPad เพราะถูกแบ่งฝั่งชัดเจนแล้ว */}
            <hr className="border-gray-200 md:hidden" />

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* QR Code ID Field: ซ่อนบนมือถือ (hidden) และแสดงเฉพาะ iPad ขึ้นไป (sm:flex หรือ md:flex) */}
              <div className="hidden sm:flex flex-col gap-1.5">
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

              {/* ชื่อ - นามสกุล */}
              <div className="flex flex-row gap-1.5">
                <div className="flex flex-col gap-1.5 w-4/5">
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
                <div className="flex flex-col gap-1.5 w-1/5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    เลขที่
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-medium outline-none cursor-not-allowed"
                    value={user.id ?? ""}
                    readOnly
                  />
                </div>
              </div>

              {/* สถาบัน */}
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
              {/* userRole === "swu" && (
                <>
                  <button
                    type="submit"
                    disabled={!scannedData || !user._id}
                    className="w-full h-24 mt-2 bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 text-center"
                  >
                    รับลงทะเบียน {dateFormatted}
                  </button>
                  <div className="flex flex-row gap-2">
                    <button
                      type="submit"
                      data-action="workshop_1"
                      disabled={
                        !scannedData ||
                        !user._id ||
                        user.workshop !== "1" ||
                        dateFormatted !== "10/7/2569"
                      }
                      className="w-full h-20 mt-2 bg-yellow-600 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:bg-yellow-700 active:bg-yellow-800 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 text-center"
                    >
                      Board game ...
                    </button>
                    <button
                      type="submit"
                      data-action="workshop_2"
                      disabled={
                        !scannedData ||
                        !user._id ||
                        user.workshop !== "2" ||
                        dateFormatted !== "10/7/2569"
                      }
                      className="w-full h-20 mt-2 bg-yellow-600 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:bg-yellow-700 active:bg-yellow-800 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 text-center"
                    >
                      AI for Librarian
                    </button>
                    <button
                      type="submit"
                      data-action="workshop_3"
                      disabled={
                        !scannedData ||
                        !user._id ||
                        user.workshop !== "3" ||
                        dateFormatted !== "10/7/2569"
                      }
                      className="w-full h-20 mt-2 bg-yellow-600 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:bg-yellow-700 active:bg-yellow-800 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 text-center"
                    >
                      Communication Technology...
                    </button>
                  </div>
                </>
              )*/}

              { /*userRole === "sponsor" && (
                <>
                  <input
                    type="hidden"
                    name="booth"
                    value={sponsor.substring(2)}
                  />
                  <button
                    type="submit"
                    disabled={!scannedData || !user._id}
                    className="flex justify-center gap-4 items-center w-full h-24 mt-2 bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 text-center"
                  >
                    <FaStamp size={20} /> Stamp {sponsor.substring(2)}{" "}
                    {dateFormatted}
                  </button>
                </>
              ) */}

              {/* Submit Button */}
              {/* <button
                type="submit"
                disabled={!scannedData || !user._id}
                className="w-full h-24 mt-2 bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 text-center"
              >
                รับลงทะเบียน {dateFormatted}
              </button>
              <div className="flex flex-row gap-2">
                <button
                  type="submit"
                  data-action="workshop_1"
                  disabled={
                    !scannedData || !user._id || dateFormatted !== "10/7/2569"
                  }
                  className="w-full h-20 mt-2 bg-yellow-600 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:bg-yellow-700 active:bg-yellow-800 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 text-center"
                >
                  workshop 1
                </button>
                <button
                  type="submit"
                  data-action="workshop_2"
                  disabled={
                    !scannedData || !user._id || dateFormatted !== "10/7/2569"
                  }
                  className="w-full h-20 mt-2 bg-yellow-600 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:bg-yellow-700 active:bg-yellow-800 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 text-center"
                >
                  workshop 2
                </button>
                <button
                  type="submit"
                  data-action="workshop_3"
                  disabled={
                    !scannedData || !user._id || dateFormatted !== "10/7/2569"
                  }
                  className="w-full h-20 mt-2 bg-yellow-600 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:bg-yellow-700 active:bg-yellow-800 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 text-center"
                >
                  workshop 3
                </button>
              </div> */}
            </form>
          </div>

          {/* ================= ซีกขวา (บน iPad) / ส่วนล่าง (บนมือถือ) ================= */}
          {/*
          <div className="flex flex-col gap-6">
            

            <hr className="border-gray-200" />

            {
            // Navigation Actions
            }
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
          */}
        </div>
      </div>
    </div>
  );
};

export default Search;
