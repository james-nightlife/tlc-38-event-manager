import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
    /**  
     * จงสร้างหน้าสถิติการเข้าร่วมโครงการประชุมสัมมนาความร่วมมือระหว่างห้องสมุดสถาบันอุดมศึกษา ครั้งที่ 38 โดยมีรายละเอียดดังนี้
     * 1. จำนวนผู้ลงทะเบียนเข้าร่วมงาน
     * 2. จำนวนผู้ลงทะเบียนเข้าร่วมงานในแต่ละวัน
     * 3. จำนวนผู้ลงทะเบียนเข้าบูธในแต่ละบูธ
     * 4. จำนวนผู้เข้าลงทะเบียนเข้าบูธครบตามเงื่อนไขในแต่ละวัน (19 บูธ)
     *
     * */
    const users = [ // ตัวอย่างข้อมูลผู้เข้าร่วมงานในฐานข้อมูล MongoDB 
        {
        "_id": {
            "$oid": "69d4adb648e1b59ab9e4de0f"
        },
        "id": 1,
        "prefix": "นาย",
        "firstname": "คนดี",
        "lastname": "ศรีนครินทร",
        "university": "มหาวิทยาลัยศรีนครินทรวิโรฒ",
        "faculty": "สำนักหอสมุดกลาง",
        "position": "นักวิชาการคอมพิวเตอร์",
        "tel": "",
        "ext": "",
        "mobile": "0123456789",
        "email": "khondi@g.swu.ac.th",
        "food": "ทั่วไป",
        "filename": "20260407-1775545782265.pdf",
        "allowJoin": "อนุมัติ",
        "allergy": "",
        "createdAt": {
            "$date": "2026-04-07T07:09:42.353Z"
        },
        "updatedAt": {
            "$date": "2026-06-24T06:55:56.538Z"
        },
        "__v": 0,
        "code": "1001",
        "register": [ // Array วันที่ลงะเบียนเข้างาน (9 และ 10 ก.ค. 2569)
            "9"
        ],
        "visit_9": [ // Array บูธผู้สนับสนุนวันที่ 9 19 ตัว ใช้ username ผู้สนับสนุน
            "ebsco"
        ],
        "visit_10": [ // Array บูธผู้สนับสนุนวันที่ 10 19 ตัว ใช้ username ผู้สนับสนุน 
            "ebsco"
        ]
        }
    ]
    const navigate = useNavigate();

    useEffect(() => {
            if(!localStorage.getItem('username')){
                navigate('/sign-in');
            }
        }, [])

  return (
    <div>Dashboard</div>
  )
}

export default Dashboard