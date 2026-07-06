import axios from 'axios'
import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from "@tanstack/react-query";

/*
const users = [
    {
        _id: { $oid: '69d4adb648e1b59ab9e4de0f' },
        id: 1,
        prefix: 'นาย',
        firstname: 'คนดี',
        lastname: 'ศรีนครินทร',
        university: 'มหาวิทยาลัยศรีนครินทรวิโรฒ',
        faculty: 'สำนักหอสมุดกลาง',
        position: 'นักวิชาการคอมพิวเตอร์',
        mobile: '0123456789',
        email: 'khondi@g.swu.ac.th',
        food: 'ทั่วไป',
        filename: '20260407-1775545782265.pdf',
        allowJoin: 'อนุมัติ',
        createdAt: { $date: '2026-04-07T07:09:42.353Z' },
        updatedAt: { $date: '2026-06-24T06:55:56.538Z' },
        __v: 0,
        code: '1001',
        register: ['9'],
        visit_9: ['ebsco'],
        visit_10: ['ebsco']
    },
    {
        _id: { $oid: '69d4adb648e1b59ab9e4de0f' },
        id: 2,
        prefix: 'นางสาว',
        firstname: 'สดใส',
        lastname: 'ประชาสัมพันธ์',
        university: 'มหาวิทยาลัยศรีนครินทรวิโรฒ',
        faculty: 'สำนักหอสมุดกลาง',
        position: 'นักวิชาการคอมพิวเตอร์',
        mobile: '0987654321',
        email: 'sodsai@g.swu.ac.th',
        food: 'ทั่วไป',
        filename: '20260407-1775545782266.pdf',
        allowJoin: 'อนุมัติ',
        createdAt: { $date: '2026-04-07T07:10:42.353Z' },
        updatedAt: { $date: '2026-06-24T06:56:56.538Z' },
        __v: 0,
        code: '1002',
        register: ['10'],
        visit_9: ['ebsco', 'pubmed'],
        visit_10: ['ebsco', 'scopus']
    }
]*/

const Dashboard = () => {
    const [users, setUsers] = useState([])
    const navigate = useNavigate()
    
    const fetchUsers = async () => {
        try {
            const response = await axios.get('https://libportal.swu.ac.th/tlcAPI/api/tlc/checkin/user', {
                headers: {
                    'Authorization': import.meta.env.VITE_API_SECRET
                }
            })
            setUsers(response.data.users)
        }catch (error) {
            console.error('Error fetching users:', error)
        }
    }

    useEffect(() => {
        if (!localStorage.getItem('username')) return navigate('/sign-in')
        fetchUsers()
    }, [])

    const [search, setSearch] = useState("");
    // New state for handling the active date filter toggle
    const [selectedDay, setSelectedDay] = useState("all"); // options: 'all', '9/7/2569', '10/7/2569'

    const days = ['9/7/2569', '10/7/2569']
    const dates = ['9', '10']
    const totalRegistered = users.length

    const filteredData = useMemo(() => {
        return users.filter((item) => {
        const searchStr = search.toLowerCase();
        return (
            (item.firstname?.toLowerCase().includes(searchStr) ||
            item.lastname?.toLowerCase().includes(searchStr) ||
            item.university?.toLowerCase().includes(searchStr) ||
            item.faculty?.toLowerCase().includes(searchStr) ||
            item.position?.toLowerCase().includes(searchStr) ||
            item.email?.toLowerCase().includes(searchStr)) && (selectedDay === "all" || item.visit?.includes(selectedDay))
        );
        });
    }, [users, search, selectedDay]);

    const [page, setPage] = useState(1);
    const offset = 10;
    const pages = Math.ceil(filteredData.length/offset);

    const dataPreview = useMemo(() => {
        const start = (page - 1) * offset;
        return filteredData.slice(start, start + offset);
    }, [filteredData, page, offset]);

    useEffect(() => {
        setPage(1);
    }, [search]);

    useEffect(() => {
        setPage(1)
        //console.log('data', data)
    }, [users])


    /**
    useEffect(() => {
        if (!localStorage.getItem('username')) navigate('/sign-in')
    }, [navigate])
    */

    

    const registerCounts = useMemo(() => {
        return users.reduce((acc, user) => {
            user.visit?.forEach((day) => {
                acc[day] = (acc[day] || 0) + 1
            })
            return acc
        }, {})
    }, [users])

    const boothCounts = useMemo(() => {
        return users.reduce((acc, user) => {
            dates.forEach((day) => {
                // If a specific day is selected, skip counting the other day
                if (selectedDay !== "all") {
                    const currentSelectedDateStr = selectedDay.split('/')[0]; // yields '9' or '10'
                    if (day !== currentSelectedDateStr) return;
                }

                const visits = user[`booth${day}`] || []
                visits.forEach((booth) => {
                    acc[booth] = (acc[booth] || 0) + 1
                })
            })
            return acc
        }, {})
    }, [users, selectedDay])
    // constant variable to count the number of users who have completed visiting at least 19 booths for each day; useMemo is used to memoize the result and save it for later rendering.
    const completeBoothCounts = useMemo(() => {
        return days.reduce((acc, day) => {
            acc[day] = users.filter((user) => {
                const visits = user[`visit_${day}`] || []
                return user.register?.includes(day) && new Set(visits).size >= 19
            }).length
            return acc
        }, {})
    }, [users])
    //complete booth count const is recorded number of booths that have been qr scanned for stamp rally.
    const boothRows = Object.entries(boothCounts).sort((a, b) => a[0].localeCompare(b[0]))
    //const variable use to record current number of participants that have visited each booth, sorted by booth name in ascending order.

    return (
        <div className='min-h-screen bg-slate-50 px-4 py-6 text-slate-900'>
            <div className='mx-auto max-w-7xl space-y-6'>
                <header className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
                    <h1 className='text-3xl font-semibold'>สถิติการเข้าร่วมงาน TLC 38</h1>
                    <p className='mt-2 text-slate-600'>สรุปจำนวนผู้ลงทะเบียนและยอดเข้าบูธในวันที่ 9 และ 10 กรกฎาคม</p>
                </header>
                {/* Global Date Filter Toggle Controls */}
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

                <section className='grid gap-4 lg:grid-cols-4'>
                    <div className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
                        <div className='text-sm font-medium text-slate-500'>จำนวนผู้ลงทะเบียนทั้งหมด</div>
                        <div className='mt-4 text-4xl font-bold text-slate-900'>{totalRegistered}</div>
                    </div>
                    {days
                        .filter(day => selectedDay === "all" || selectedDay === day)
                        .map((day) => (
                        <div key={day} className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
                            <div className='text-sm font-medium text-slate-500'>ลงทะเบียนวันที่ {day}</div>
                            <div className='mt-4 text-4xl font-bold text-slate-900'>{registerCounts[day] || 0}</div>
                        </div>
                    ))}
                </section>

                <section className='grid gap-4 lg:grid-cols-2'>
                    <div className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
                        <h2 className='text-xl font-semibold text-slate-900'>ผู้ลงทะเบียนเข้าบูธครบ 19 บูธ</h2>
                        <p className='mt-2 text-slate-600'>นับเฉพาะผู้ที่ลงทะเบียนเข้าร่วมงานในวันนั้นและเข้าบูธอย่างน้อย 19 บูธ</p>
                        <div className='mt-6 space-y-4'>
                            {days.filter(day => selectedDay === "all" || selectedDay === day).map((day) => (
                                <div key={day} className='rounded-3xl border border-slate-200 bg-slate-50 p-4'>
                                    <div className='text-sm text-slate-500'>วันที่ {day}</div>
                                    <div className='mt-2 text-3xl font-bold text-slate-900'>{completeBoothCounts[day] || 0}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
                        <h2 className='text-xl font-semibold text-slate-900'>จำนวนผู้ลงทะเบียนเข้าบูธตามบูธ</h2>
                        <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-full text-slate-600 font-medium">
                                Showing: {selectedDay === 'all' ? 'Both Days' : `Day ${selectedDay.split('/')[0]}`}
                            </span>
                        <div className='mt-4 overflow-x-auto'>
                            <table className='w-full border-collapse text-left text-sm'>
                                <thead>
                                    <tr>
                                        <th className='border-b border-slate-200 px-4 py-3 font-medium text-slate-600'>บูธ</th>
                                        <th className='border-b border-slate-200 px-4 py-3 font-medium text-slate-600'>จำนวนผู้เข้าชม</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {boothRows.length > 0 ? (
                                        boothRows.map(([booth, count]) => (
                                            <tr key={booth} className='odd:bg-slate-50'>
                                                <td className='border-b border-slate-200 px-4 py-3'>{booth}</td>
                                                <td className='border-b border-slate-200 px-4 py-3'>{count}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan='2' className='border-b border-slate-200 px-4 py-3 text-slate-500'>ไม่มีข้อมูลบูธ</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
                <section className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4'>
                    <h2 className='text-xl font-semibold text-slate-900'>รายชื่อผู้ลงทะเบียน</h2>
                    <div className="flex gap-2 items-center">
                        <label className="font-bold">ค้นหาผู้เข้าร่วม</label>
                        <input
                        type="text"
                        placeholder="ค้นหาชื่อตัว ชื่อสกุล สถาบันอุดมศึกษา ส่วนราชการหรือส่วนงาน หรือ ตำแหน่ง"
                        className="border p-2 rounded-lg w-full md:w-1/2"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        />
                        <div>ผลลัพธ์ {filteredData.length} จากทั้งหมด {users.length} รายการ</div>
                    </div>
                    <div className='overflow-x-auto'>
                        <table className='w-full border-collapse text-left text-sm'>
                            <thead>
                                <tr>
                                    <th className='border-b border-slate-200 px-4 py-3 font-medium text-slate-600'>ที่</th>
                                    <th className='border-b border-slate-200 px-4 py-3 font-medium text-slate-600'>ชื่อ - สกุล</th>
                                    <th className='border-b border-slate-200 px-4 py-3 font-medium text-slate-600'>มหาวิทยาลัย</th>
                                    <th className='border-b border-slate-200 px-4 py-3 font-medium text-slate-600'>ลงทะเบียนวันที่ 9 ก.ค. 2569</th>
                                    <th className='border-b border-slate-200 px-4 py-3 font-medium text-slate-600'>ลงทะเบียนวันที่ 10 ก.ค. 2569</th>
                                    <th className='border-b border-slate-200 px-4 py-3 font-medium text-slate-600'>เข้าบูธวันที่ 9 ก.ค. 2569</th>
                                    <th className='border-b border-slate-200 px-4 py-3 font-medium text-slate-600'>เข้าบูธวันที่ 10 ก.ค. 2569</th>
                                    <th className='border-b border-slate-200 px-4 py-3 font-medium text-slate-600'>Workshop ที่ลงทะเบียนไว้</th>
                                    <th className='border-b border-slate-200 px-4 py-3 font-medium text-slate-600'>ลงทะเบียนเข้าร่วม Workshop</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dataPreview.length > 0 ? (
                                    dataPreview.map((user, idx) => (
                                        <tr key={user._id.$oid} className='odd:bg-slate-50'>
                                            <td className='border-b border-slate-200 px-4 py-3'>{(offset * (page - 1)) + (idx + 1)}</td>
                                            <td className='border-b border-slate-200 px-4 py-3'>{user.prefix}{user.firstname} {user.lastname}</td>    
                                            <td className='border-b border-slate-200 px-4 py-3'>{user.university}</td>
                                            <td className='border-b border-slate-200 px-4 py-3'>{user.visit?.includes('9/7/2569') ? 'เข้าร่วมงานแล้ว' : 'ยังไม่เข้าร่วมงาน'}</td>
                                            <td className='border-b border-slate-200 px-4 py-3'>{user.visit?.includes('9/7/2569') ? 'เข้าร่วมงานแล้ว' : 'ยังไม่เข้าร่วมงาน'}</td>  
                                            <td className='border-b border-slate-200 px-4 py-3'>{user.booth9?.length}</td>
                                            <td className='border-b border-slate-200 px-4 py-3'>{user.booth10?.length}</td>
                                            <td className='border-b border-slate-200 px-4 py-3'>{user.workshop}</td>
                                            <td className='border-b border-slate-200 px-4 py-3'>{user.workshop_checkin ? 'เข้าร่วม Workshop แล้ว' : 'ยังไม่เข้าร่วม Workshop'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan='10' className='border-b border-slate-200 px-4 py-3 text-slate-500'>ไม่มีข้อมูลผู้ลงทะเบียน</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/** หน้า */}
                    <div className='flex gap-4 items-center'>
                        <button onClick={() => page > 1 && setPage(page-1)} className='flex-1 cursor-pointer'>ก่อนหน้า</button>
                        <div>หน้า </div>
                        <input 
                        value={page} 
                        name='page' 
                        type='number' 
                        min={1} 
                        max={pages} 
                        onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val) && (val < pages+1) && (val > 0)) {
                            setPage(val);
                            }}} />
                        <div> จาก {pages} </div>
                        <button onClick={() => page < pages && setPage(page+1)} className='flex-1 cursor-pointer'>ถัดไป</button>
                    </div>
                    <Link to='/'>
                    กลับไปหน้าหลัก
                    </Link>
                </section>
            </div>
        </div>
    )
}

export default Dashboard