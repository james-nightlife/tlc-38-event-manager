import React, { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

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
]

const Dashboard = () => {
    const navigate = useNavigate()

    useEffect(() => {
        if (!localStorage.getItem('username')) navigate('/sign-in')
    }, [navigate])

    const days = ['9', '10']
    const totalRegistered = users.length

    const registerCounts = useMemo(() => {
        return users.reduce((acc, user) => {
            user.register?.forEach((day) => {
                acc[day] = (acc[day] || 0) + 1
            })
            return acc
        }, {})
    }, [])

    const boothCounts = useMemo(() => {
        return users.reduce((acc, user) => {
            days.forEach((day) => {
                const visits = user[`visit_${day}`] || []
                visits.forEach((booth) => {
                    acc[booth] = (acc[booth] || 0) + 1
                })
            })
            return acc
        }, {})
    }, [])

    const completeBoothCounts = useMemo(() => {
        return days.reduce((acc, day) => {
            acc[day] = users.filter((user) => {
                const visits = user[`visit_${day}`] || []
                return user.register?.includes(day) && new Set(visits).size >= 19
            }).length
            return acc
        }, {})
    }, [])

    const boothRows = Object.entries(boothCounts).sort((a, b) => a[0].localeCompare(b[0]))

    return (
        <div className='min-h-screen bg-slate-50 px-4 py-6 text-slate-900'>
            <div className='mx-auto max-w-7xl space-y-6'>
                <header className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
                    <h1 className='text-3xl font-semibold'>สถิติการเข้าร่วมงาน TLC 38</h1>
                    <p className='mt-2 text-slate-600'>สรุปจำนวนผู้ลงทะเบียนและยอดเข้าบูธในวันที่ 9 และ 10 กรกฎาคม</p>
                </header>

                <section className='grid gap-4 lg:grid-cols-4'>
                    <div className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
                        <div className='text-sm font-medium text-slate-500'>จำนวนผู้ลงทะเบียนทั้งหมด</div>
                        <div className='mt-4 text-4xl font-bold text-slate-900'>{totalRegistered}</div>
                    </div>
                    {days.map((day) => (
                        <div key={day} className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
                            <div className='text-sm font-medium text-slate-500'>ลงทะเบียนวันที่ {day} กรกฎาคม</div>
                            <div className='mt-4 text-4xl font-bold text-slate-900'>{registerCounts[day] || 0}</div>
                        </div>
                    ))}
                </section>

                <section className='grid gap-4 lg:grid-cols-2'>
                    <div className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
                        <h2 className='text-xl font-semibold text-slate-900'>ผู้ลงทะเบียนเข้าบูธครบ 19 บูธ</h2>
                        <p className='mt-2 text-slate-600'>นับเฉพาะผู้ที่ลงทะเบียนเข้าร่วมงานในวันนั้นและเข้าบูธอย่างน้อย 19 บูธ</p>
                        <div className='mt-6 space-y-4'>
                            {days.map((day) => (
                                <div key={day} className='rounded-3xl border border-slate-200 bg-slate-50 p-4'>
                                    <div className='text-sm text-slate-500'>วันที่ {day} กรกฎาคม</div>
                                    <div className='mt-2 text-3xl font-bold text-slate-900'>{completeBoothCounts[day] || 0}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
                        <h2 className='text-xl font-semibold text-slate-900'>จำนวนผู้ลงทะเบียนเข้าบูธตามบูธ</h2>
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
            </div>
        </div>
    )
}

export default Dashboard