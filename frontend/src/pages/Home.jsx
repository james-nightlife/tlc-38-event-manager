import { useEffect, useState } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
    const [scannedData, setScannedData] = useState(null); // เก็บข้อมูลที่สแกนได้
    const [user, setUser] = useState({});

    const sponsor = localStorage.getItem('role') === 'sponsor' ? localStorage.getItem('username') : null;

    const now = new Date();
    const now_text = now.toLocaleDateString('th-TH')

    const navigate = useNavigate();

    useEffect(() => {
        if(!localStorage.getItem('username')){
            navigate('/sign-in');
        }
    }, [])

    const fetchUserData = async (userId) => {
        if (!userId) {
            alert('Please enter or scan a valid ID.');
            return;
        }
        
        try {
            const req = await axios.get(`https://libportal.swu.ac.th/tlcAPI/api/tlc/checkin/user/${userId}`, {
                headers: {
                    'Authorization': import.meta.env.VITE_API_SECRET
                }
            }); 
            setUser(req.data.user || {});
        } catch (error) {
            console.error(error);
            alert('Error fetching user data. Please try again.');
        }  
    };

    const handleScan = (data) => { // ฟังก์ชันที่ถูกเรียกเมื่อสแกนสำเร็จ
        if (data && data[0]?.rawValue) {
            const qrValue = data[0].rawValue;
            setScannedData(qrValue); // Update input field
            fetchUserData(qrValue);  // Execute API call immediately
        }
    }

    const handleError = (error) => { // ฟังก์ชันที่ถูกเรียกเมื่อเกิดข้อผิดพลาด
        console.error(error);
        alert('Error scanning QR code. Please try again.');
    }

    const handleSubmit = async (e) => { // ฟังก์ชันที่ถูกเรียกเมื่อ submit form
        e.preventDefault();
        //alert(import.meta.env.VITE_API_SECRET || 'No API secret found. Please check your environment variables.');
        try{
            //alert(`http://10.1.117.200:3000/api/v1/tlc/register/${selectedEvent}/${scannedData}`)
            const req = await axios.put(
                `https://libportal.swu.ac.th/tlcAPI/api/tlc/checkin/user/${e.target.id.value}`,
                {
                        action: e.target.action.value,
                        booth: sponsor,
                        date: e.target.date?.value
                },
                {
                    headers: {
                        'Authorization': import.meta.env.VITE_API_SECRET
                    },
                }
            )
            alert(req.data.message);
        }catch(e){
            if(e.response && e.response.data && e.response.data.message){
                return alert(e.response.data.message);
            }
            alert(e)
        }finally{
            navigate(0); // Refresh the page after submission
        }
    }

    const handleSignOut = () => {
        localStorage.clear();
        navigate(0);
    }

    const handleInputChange = async (e) => {
        fetchUserData(scannedData);
    }
  return (
    <>
        <div className='flex justify-center p-4'>
            <div className='border flex flex-col p-4 gap-4'>
            <div className='text-center'>นำกล้องส่องคิวอาร์โค้ดของผู้เข้าร่วมงาน</div>
            <Scanner // คอมโพเนนต์สำหรับสแกน QR code
                onScan={handleScan} 
                onError={handleError} />
            <div>QR Code ID หรืออีเมล : </div>
            <input type="text" value={scannedData || ''} onChange={(e) => setScannedData(e.target.value)} />
            <button type='button' onClick={handleInputChange}>ตรวจสอบข้อมูล</button>
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <div>QR Code ID : </div>
            <input type="text" name='id' value={user._id || ''} readOnly />
            <div>ชื่อ : </div>
            <input type="text" value={`${user.prefix || ''}${user.firstname || ''} ${user.lastname || ''}`} readOnly />
            <div>สถาบันอุดมศึกษา : </div>
            <input type="text" value={user.university || ''} readOnly />
            
            {
                localStorage.getItem('role') === 'swu' && (
                    <>
                    <div>กิจกรรม : </div>
                    <select required name='action'>
                        <option value="">เลือกกิจกรรม</option>
                        <option value="9/7/2569">ลงทะเบียนวันที่ 9 ก.ค. 2569</option>
                        <option value="10/7/2569">ลงทะเบียนวันที่ 10 ก.ค. 2569</option>
                        <option value="workshop_1">ลงทะเบียน Workshop 1</option>
                        <option value="workshop_2">ลงทะเบียน Workshop 2</option>
                        <option value="workshop_3">ลงทะเบียน Workshop 3</option>
                    </select>
                    </>
                )
            }
            {
                localStorage.getItem('role') === 'sponsor' && (
                    <>
                        <div>ผู้สนับสนุน : </div>
                        <input type="text" name='booth' value={sponsor}  readOnly />
                        <div>วันที่เข้าบูธ : </div>
                        <select required name='date'>
                            <option value="">เลือกกิจกรรม</option>
                            <option value="9/7/2569">ลงทะเบียนวันที่ 9 ก.ค. 2569</option>
                            <option value="10/7/2569">ลงทะเบียนวันที่ 10 ก.ค. 2569</option>
                        </select>
                    </>
                )
            }
            
            <button 
                type="submit" 
                disabled={!scannedData}>รับลงทะเบียน</button>
            
        </form>
        
            <Link to="/dashboard" className='bg-blue-500 hover:bg-blue-400 cursor-pointer text-white px-4 py-2 rounded text-center'>สถิติ</Link>
            <button onClick={handleSignOut}>ออกจากระบบ</button>
        </div>
        </div>
        
    </>
    
  )
}

export default Home