import { useEffect, useState } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    useEffect(() => {
        if(!localStorage.getItem('username')){
            navigate('/sign-in');
        }
    }, [])

    const [scannedData, setScannedData] = useState(null); // เก็บข้อมูลที่สแกนได้
    const [selectedEvent, setSelectedEvent] = useState(''); // เก็บค่าของ event ที่เลือก

    const now = new Date();
    const now_text = now.toLocaleDateString('th-TH')

    const handleScan = (data) => { // ฟังก์ชันที่ถูกเรียกเมื่อสแกนสำเร็จ
        setScannedData(data[0].rawValue);
    }

    const handleError = (error) => { // ฟังก์ชันที่ถูกเรียกเมื่อเกิดข้อผิดพลาด
        console.error(error);
        alert('Error scanning QR code. Please try again.');
    }

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
        <Scanner // คอมโพเนนต์สำหรับสแกน QR code
            onScan={handleScan} 
            onError={handleError} />
        <div>{scannedData ? `Scanned Data: ${scannedData}` : 'No data scanned yet.'}</div>
        <div>Selected Event: {selectedEvent}</div>
        <form onSubmit={handleSubmit}>
            <select name="day" value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)}>
                <option value=''>วันที่</option>
                <option value="9">9 ก.ค. 2569</option>
                <option value="10">10 ก.ค. 2569</option>
            </select>
            <button type="submit" disabled={!(selectedEvent && scannedData)}>Register {now_text}</button>
            <div></div>
        </form>
        <button onClick={handleSignOut}>ออกจากระบบ</button>
    </>
    
  )
}

export default Home