import React from 'react'
import { Scanner } from '@yudiel/react-qr-scanner';

const Home = () => {
    const [scannedData, setScannedData] = React.useState(null); // เก็บข้อมูลที่สแกนได้

    const handleScan = (data) => { // ฟังก์ชันที่ถูกเรียกเมื่อสแกนสำเร็จ
        setScannedData(data[0].rawValue);
    }

    const handleError = (error) => { // ฟังก์ชันที่ถูกเรียกเมื่อเกิดข้อผิดพลาด
        alert('Error scanning QR code. Please try again.');
    }
  return (
    <>
        <Scanner // คอมโพเนนต์สำหรับสแกน QR code
            onScan={handleScan} 
            onError={handleError} />
        <div>{scannedData ? `Scanned Data: ${scannedData}` : 'No data scanned yet.'}</div>
    </>
    
  )
}

export default Home