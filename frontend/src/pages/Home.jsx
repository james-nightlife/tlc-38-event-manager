import { useEffect, useState } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [scannedData, setScannedData] = useState(null); // เก็บข้อมูลที่สแกนได้
    const [selectedEvent, setSelectedEvent] = useState(''); // เก็บค่าของ event ที่เลือก
    const [user, setUser] = useState({});

    const now = new Date();
    const now_text = now.toLocaleDateString('th-TH')

    const navigate = useNavigate();

    useEffect(() => {
        if(!localStorage.getItem('username')){
            navigate('/sign-in');
        }
    }, [])

    const handleScan = (data) => { // ฟังก์ชันที่ถูกเรียกเมื่อสแกนสำเร็จ
        setScannedData(data[0].rawValue);
    }

    const handleError = (error) => { // ฟังก์ชันที่ถูกเรียกเมื่อเกิดข้อผิดพลาด
        console.error(error);
        alert('Error scanning QR code. Please try again.');
    }

    useEffect(() => {
        if(!scannedData){
            setUser({})
            return;
        }
        setUser({
            name: 'นายคนดี ศรีนครินทร',
            university: 'มหาวิทยาลัยศรีนครินทรวิโรฒ'
        })
    }, [scannedData])

    const handleSubmit = async (e) => { // ฟังก์ชันที่ถูกเรียกเมื่อ submit form
        e.preventDefault();
        try{
            //alert(`http://10.1.117.200:3000/api/v1/tlc/register/${selectedEvent}/${scannedData}`)
            const req = await axios.get(
                `http://10.1.117.200:3000/api/v1/tlc/register/${selectedEvent}/${scannedData}`
            )
        }catch(e){
            alert(e)
        }finally{
            setScannedData('');
        }
    }

    const handleSignOut = () => {
        localStorage.clear();
        navigate(0);
    }
  return (
    <>
        <form onSubmit={handleSubmit} className='border flex flex-col p-4 gap-4'>
            <div>นำกล้องส่องคิวอาร์โค้ดของผู้เข้าร่วมงาน</div>
            <Scanner // คอมโพเนนต์สำหรับสแกน QR code
                onScan={handleScan} 
                onError={handleError} />
            <div>QR Code ID : {scannedData || 'ไม่พบ'}</div>
            <div>ชื่อ : {user.name}</div>
            <div>สถาบันอุดมศึกษา : {user.university}</div>
            <div>วัน / เดือน / ปี : {now_text}</div>
            <div>กิจกรรม : </div>
            <button 
                type="submit" 
                disabled={!scannedData}>รับลงทะเบียน</button>
            <button onClick={handleSignOut}>ออกจากระบบ</button>
        </form>
    </>
    
  )
}

export default Home