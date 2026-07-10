import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaCheck } from "react-icons/fa";

// ------
import { useQuery } from "@tanstack/react-query";
// โมดูลบันทึกเป็น xlsx
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const arrWorkshops = [
  " ",
  "Board game for Library",
  "AI for Librarian",
  "Communication Technology for Library",
];

const Dashboard = () => {
  const navigate = useNavigate();

  // ---------
  useEffect(() => {
    if (!localStorage.getItem("username")) {
      navigate("/sign-in");
    }
  }, [navigate]);

  // --------
  const fetchUsers = async () => {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/tlc/checkin/user`,
      {
        headers: {
          Authorization: import.meta.env.VITE_API_SECRET,
        },
      },
    );
    const getusers = response.data.users || [];
    // เติม field นับจำนวนบูธที่ลงทะเบียนในแต่ละวัน สำหรับบันทึกเป็น xlsx
    const users = getusers.map((x) => ({...x, booth9count: x.booth9?.length, booth10count: x.booth10?.length}))

    return [...users].sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;

      return dateB - dateA;
    });
  };

  // 3. --------
  const {
    data: users = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["usersData"],
    queryFn: fetchUsers,
    refetchInterval: 3000,
    refetchIntervalInBackground: true,
    enabled: !!localStorage.getItem("username"),
  });

  const [search, setSearch] = useState("");
  const [selectedDay, setSelectedDay] = useState("all");

  const days = ["9/7/2569", "10/7/2569"];
  const dates = ["9", "10"];
  const totalRegistered = users.length;

   const [showUserSelected, setShowUserSelected] = useState(false)

  const filteredData = useMemo(() => {
    return users.filter((item) => {
      setShowUserSelected(false)
      const searchStr = search.toLowerCase();
      return (
        (item.firstname?.toLowerCase().includes(searchStr) ||
          item.lastname?.toLowerCase().includes(searchStr) ||
          item.university?.toLowerCase().includes(searchStr) ||
          item.faculty?.toLowerCase().includes(searchStr) ||
          item.position?.toLowerCase().includes(searchStr) ||
          item.email?.toLowerCase().includes(searchStr) ||
          (item.id?.toString().includes(searchStr))) &&
        (selectedDay === "all" || item.visit?.includes(selectedDay))
      );
    });
  }, [users, search, selectedDay]);

  const [page, setPage] = useState(1);
  const offset = 10;
  const pages = Math.ceil(filteredData.length / offset) || 1;

  const dataPreview = useMemo(() => {
    const start = (page - 1) * offset;
    return filteredData.slice(start, start + offset);
  }, [filteredData, page, offset]);

  // รีเซ็ตหน้าเมื่อมีการค้นหา
  useEffect(() => {
    setPage(1);
  }, [search]);

  // รีเซ็ตหน้าเมื่อข้อมูลในฐานข้อมูลเปลี่ยนความยาว (เช่น มีคนลงทะเบียนเพิ่มเข้ามา)
  useEffect(() => {
    setPage(1);
  }, [users.length]);

  const registerCounts = useMemo(() => {
    return users.reduce((acc, user) => {
      user.visit?.forEach((day) => {
        acc[day] = (acc[day] || 0) + 1;
      });
      return acc;
    }, {});
  }, [users]);

  const boothCounts = useMemo(() => {
    return users.reduce((acc, user) => {
      dates.forEach((day) => {
        if (selectedDay !== "all") {
          const currentSelectedDateStr = selectedDay.split("/")[0];
          if (day !== currentSelectedDateStr) return;
        }

        const visits = user[`booth${day}`] || [];
        visits.forEach((booth) => {
          acc[booth] = (acc[booth] || 0) + 1;
        });
      });
      return acc;
    }, {});
  }, [users, selectedDay]);

  const boothCompleteDay9 = useMemo(() => {
    return users.filter((x) => {
      const booth9 = x.booth9;
      return booth9.length >= 12;
    })
  }, [users])

  const boothCompleteDay10 = useMemo(() => {
    return users.filter((x) => {
      const booth9 = x.booth9;
      const booth10 = x.booth10;
      const booth = new Set([...booth9, ...booth10]);
      return booth.size >= 15;
    })
  }, [users])

  const workshop1 = useMemo(() => {
    return users.filter((x) => {
      const workshop_id = x.workshop;
      const workshop_visit = x.workshop_checkin;
      return (workshop_id === '1') && workshop_visit;
    })
  }, [users])


  const workshop2 = useMemo(() => {
    return users.filter((x) => {
      const workshop_id = x.workshop;
      const workshop_visit = x.workshop_checkin;
      return (workshop_id === '2') && workshop_visit;
    })
  }, [users])

  const workshop3 = useMemo(() => {
    return users.filter((x) => {
      const workshop_id = x.workshop;
      const workshop_visit = x.workshop_checkin;
      return (workshop_id === '3') && workshop_visit;
    })
  }, [users])

  const boothRows = Object.entries(boothCounts).sort((a, b) =>
    a[0].localeCompare(b[0]),
  );

  // แสดงข้อมูลผู้ร่วมงานที่เลือก
  const [userSelected, setUserSelected] = useState({});
 

  const handleUserSelected = (user_id) => {
    setUserSelected(users.find((x) => (x.id === user_id)))
    setShowUserSelected(true)
  }

  // เมธอดบันทึกเป็น xlsx
  const handleXLSX = (data, filename) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Buffer the output and trigger download
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `${filename}_${new Date().getTime()}.xlsx`);
  }

  // --------
  if (isLoading)
    return (
      <div className="text-center py-20 font-semibold text-slate-600">
        กำลังโหลดข้อมูล...
      </div>
    );
  if (error)
    return (
      <div className="text-center py-20 text-red-500">
        เกิดข้อผิดพลาด: {error.message}
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-semibold">
                สถิติการเข้าร่วมงาน TLC 38
              </h1>
              <p className="mt-2 text-slate-600">
                สรุปจำนวนผู้ลงทะเบียนและยอดเข้าบูธในวันที่ 9 และ 10 กรกฎาคม 2569
              </p>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-bold tracking-tight">Event Dashboard</h1>
          <div className="flex p-1 bg-slate-200/70 rounded-xl space-x-1 text-sm font-medium">
            <button
              onClick={() => setSelectedDay("all")}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${selectedDay === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
            >
              All Days
            </button>
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${selectedDay === day ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
              >
                Date {day}
              </button>
            ))}
          </div>
        </div>

        <section className="grid gap-4 lg:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-medium text-slate-500">
              จำนวนผู้ลงทะเบียนทั้งหมด
            </div>
            <div className="mt-4 text-4xl font-bold text-slate-900">
              {totalRegistered}
            </div>
          </div>
          {days
            .filter((day) => selectedDay === "all" || selectedDay === day)
            .map((day) => (
              <div
                key={day}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="text-sm font-medium text-slate-500">
                  ลงทะเบียนวันที่ {day}
                </div>
                <div className="mt-4 text-4xl font-bold text-slate-900">
                  {registerCounts[day] || 0}
                </div>
              </div>
            ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              ผู้ลงทะเบียนเข้าบูธครบตามเงื่อนไข
            </h2>
            <p className="mt-2 text-slate-600">
              วันที่ 9 ก.ค. 2569 เข้าบูธ 12 บูธขึ้นไป วันที่ 10 ก.ค. 2569
              เข้าบูธครบ 15 บูธ (รวม 2 วัน ไม่ซ้ำกัน)
            </p>
            <div className="mt-6 space-y-4">
              <div
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="text-sm text-slate-500">วันที่ 9 ก.ค. 2569 เข้าบูธ 12 บูธขึ้นไป</div>
                    <div className="flex justify-between">
                    <div className="mt-2 text-3xl font-bold text-slate-900">
                      {boothCompleteDay9.length || 0}
                    </div>
                    <button onClick={() => handleXLSX(boothCompleteDay9, 'tlc_completeBoothDay9')}>
                      บันทึกเป็น XLSX
                    </button>
                    </div>
                  </div>
              <div
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="text-sm text-slate-500">วันที่ 10 ก.ค. 2569 เข้าบูธครบ 15 บูธ (รวม 2 วัน ไม่ซ้ำกัน)</div>
                    <div className="flex justify-between">
                    <div className="mt-2 text-3xl font-bold text-slate-900">
                      {boothCompleteDay10.length || 0}
                    </div>
                    <button onClick={() => handleXLSX(boothCompleteDay10, 'tlc_completeBoothDay10')}>
                      บันทึกเป็น XLSX
                    </button>
                    </div>
                  </div>

                  <div
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="text-sm text-slate-500">ผู้เข้าร่วม Workshop 1</div>
                    <div className="flex justify-between">
                    <div className="mt-2 text-3xl font-bold text-slate-900">
                      {workshop1.length || 0}
                    </div>
                    <button onClick={() => handleXLSX(workshop1, 'tlc_completeBoothDay10')}>
                      บันทึกเป็น XLSX
                    </button>
                    </div>
                  </div>

                  <div
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="text-sm text-slate-500">ผู้เข้าร่วม Workshop 2</div>
                    <div className="flex justify-between">
                    <div className="mt-2 text-3xl font-bold text-slate-900">
                      {workshop2.length || 0}
                    </div>
                    <button onClick={() => handleXLSX(workshop2, 'tlc_completeBoothDay10')}>
                      บันทึกเป็น XLSX
                    </button>
                    </div>
                  </div>

                  <div
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="text-sm text-slate-500">ผู้เข้าร่วม Workshop 3</div>
                    <div className="flex justify-between">
                    <div className="mt-2 text-3xl font-bold text-slate-900">
                      {workshop3.length || 0}
                    </div>
                    <button onClick={() => handleXLSX(workshop3, 'tlc_completeBoothDay10')}>
                      บันทึกเป็น XLSX
                    </button>
                    </div>
                  </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              จำนวนผู้ลงทะเบียนเข้าบูธตามบูธ
            </h2>
            <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-full text-slate-600 font-medium">
              Showing:{" "}
              {selectedDay === "all"
                ? "Both Days"
                : `Day ${selectedDay.split("/")[0]}`}
            </span>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr>
                    <th className="border-b border-slate-200 px-4 py-3 font-medium text-slate-600">
                      บูธ
                    </th>
                    <th className="border-b border-slate-200 px-4 py-3 font-medium text-slate-600">
                      จำนวนผู้เข้าชม
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {boothRows.length > 0 ? (
                    boothRows.map(([booth, count]) => (
                      <tr key={booth} className="odd:bg-slate-50">
                        <td className="border-b border-slate-200 px-4 py-3">
                          {booth}
                        </td>
                        <td className="border-b border-slate-200 px-4 py-3">
                          {count}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="2"
                        className="border-b border-slate-200 px-4 py-3 text-slate-500"
                      >
                        ไม่มีข้อมูลบูธ
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-slate-900">
            รายชื่อผู้ลงทะเบียน
          </h2>
          <div className="flex gap-2 items-center">
            <label className="font-bold">ค้นหาผู้เข้าร่วม</label>
            <input
              type="text"
              placeholder="ค้นหาชื่อตัว ชื่อสกุล สถาบันอุดมศึกษา ส่วนราชการหรือส่วนงาน ตำแหน่ง อีเมล และลำดับ"
              className="border p-2 rounded-lg w-full md:w-1/2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div>
              ผลลัพธ์ {filteredData.length} จากทั้งหมด {users.length} รายการ
            </div>
          </div>
          {/** ส่วนข้อมูลที่เลือก */}
          {showUserSelected && (
            <div>
              <div>เลขที่ : {userSelected.id}</div>
              <div>ชื่อ - สกุล : {userSelected.prefix}{userSelected.firstname} {userSelected.lastname}</div>
              <div>มหาวิทยาลัย : {userSelected.university}</div>
              <div className="flex">เข้าบูธวันที่ 9 ก.ค. 2569 : {userSelected.booth9?.length} {userSelected.booth9?.length > 0 && (<>
              (<span className="flex gap-2">{userSelected.booth9?.map((x, idx) => (<span>{x}</span>))}</span>)</>)}</div>
              <div className="flex">เข้าบูธวันที่ 10 ก.ค. 2569 : {userSelected.booth10?.length} {userSelected.booth10?.length > 0 && (<>
              (<span className="flex gap-2">{userSelected.booth10?.map((x, idx) => (<span>{x}</span>))}</span>)</>)}</div>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr>
                  <th className="border-b border-slate-200 px-4 py-3 font-medium text-slate-600">
                    เลขที่
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 font-medium text-slate-600">
                    ชื่อ - สกุล
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 font-medium text-slate-600">
                    มหาวิทยาลัย
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 font-medium text-slate-600">
                    ลงทะเบียนวันที่ 9 ก.ค. 2569
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 font-medium text-slate-600">
                    ลงทะเบียนวันที่ 10 ก.ค. 2569
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 font-medium text-slate-600">
                    เข้าบูธวันที่ 9 ก.ค. 2569
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 font-medium text-slate-600">
                    เข้าบูธวันที่ 10 ก.ค. 2569
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 font-medium text-slate-600">
                    Workshop ที่ลงทะเบียนไว้
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 font-medium text-slate-600">
                    ลงทะเบียนเข้าร่วม Workshop
                  </th>
                </tr>
              </thead>
              <tbody>
                {dataPreview.length > 0 ? (
                  dataPreview.map((user, idx) => (
                    <tr key={user._id?.$oid || idx} className="odd:bg-slate-50">
                      <td className="border-b border-slate-200 px-4 py-3">
                        {user.id /* {offset * (page - 1) + (idx + 1)} */}
                      </td>
                      <td className="border-b border-slate-200 px-4 py-3">
                        {user.prefix}
                        {user.firstname} {user.lastname}
                      </td>
                      <td className="border-b border-slate-200 px-4 py-3">
                        {user.university}
                      </td>
                      <td className="border-b border-slate-200 px-4 py-3">
                        {user.visit?.includes("9/7/2569") ? (
                          <FaCheck color="green" />
                        ) : (
                          ""
                        )}
                      </td>
                      <td className="border-b border-slate-200 px-4 py-3">
                        {user.visit?.includes("10/7/2569") ? (
                          <FaCheck color="green" />
                        ) : (
                          ""
                        )}
                      </td>
                      <td className="border-b border-slate-200 px-4 py-3 underline hover:text-blue-500 hover:cursor-pointer" onClick={() => handleUserSelected(user.id)}>
                        {user.booth9?.length || 0}
                      </td>
                      <td className="border-b border-slate-200 px-4 py-3 underline hover:text-blue-500 hover:cursor-pointer" onClick={() => handleUserSelected(user.id)}>
                        {user.booth10?.length || 0}
                      </td>
                      <td className="border-b border-slate-200 px-4 py-3">
                        {user.workshop} - {arrWorkshops[user.workshop]}
                      </td>
                      <td className="border-b border-slate-200 px-4 py-3">
                        {user.workshop_checkin ? <FaCheck color="green" /> : ""}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="9"
                      className="border-b border-slate-200 px-4 py-3 text-slate-500 text-center"
                    >
                      ไม่มีข้อมูลผู้ลงทะเบียน
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex gap-4 items-center justify-between">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50 cursor-pointer"
            >
              ก่อนหน้า
            </button>
            <div className="flex items-center gap-2">
              <span>หน้า</span>
              <input
                value={page}
                name="page"
                type="number"
                min={1}
                max={pages}
                className="border rounded px-2 py-1 w-16 text-center"
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val <= pages && val > 0) {
                    setPage(val);
                  }
                }}
              />
              <span>จาก {pages}</span>
            </div>
            <button
              disabled={page >= pages}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50 cursor-pointer"
            >
              ถัดไป
            </button>
          </div>
          <button onClick={() => handleXLSX(filteredData, 'tlc_participant')}>
                บันทึกเป็น XLSX
          </button>
          <Link
            to="/"
            className="text-blue-600 hover:underline mt-2 inline-block"
          >
            กลับไปหน้าหลัก
          </Link>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
