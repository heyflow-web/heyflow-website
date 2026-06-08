import { MapPin, Phone, Clock, Globe } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-info">
            <h2 className="footer-logo">DONGTAN <span>ORTHO</span></h2>
            <p>환자의 마음까지 치료하는 정직한 병원,<br />동탄 정형외과가 여러분의 건강한 일상을 응원합니다.</p>
            <div className="social-icons">
              <a href="#"><Globe size={20} /></a>
            </div>
          </div>

          <div className="footer-links">
            <h3>빠른 메뉴</h3>
            <ul>
              <li><a href="/about">병원 소개</a></li>
              <li><a href="/treatment">진료 안내</a></li>
              <li><a href="/location">오시는 길</a></li>
              <li><a href="#">온라인 예약</a></li>
            </ul>
          </div>

          <div className="footer-contact">
            <h3>고객 센터</h3>
            <ul>
              <li><MapPin size={18} /> 경기도 화성시 동탄대로... (상세주소)</li>
              <li><Phone size={18} /> 031-000-0000</li>
              <li><Clock size={18} /> 평일 09:00 - 19:00 | 토요일 09:00 - 14:00</li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 Dongtan Orthopedics. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
