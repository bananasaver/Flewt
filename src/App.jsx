import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Landing from './pages/Landing.jsx';
import Tools from './pages/Tools.jsx';
import Pricing from './pages/Pricing.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import MergePdf from './pages/tools/MergePdf.jsx';
import SplitPdf from './pages/tools/SplitPdf.jsx';
import CompressPdf from './pages/tools/CompressPdf.jsx';
import RotatePdf from './pages/tools/RotatePdf.jsx';
import WatermarkPdf from './pages/tools/WatermarkPdf.jsx';
import PdfToWord from './pages/tools/PdfToWord.jsx';
import EditPdf from './pages/tools/EditPdf.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/tools/merge" element={<MergePdf />} />
          <Route path="/tools/split" element={<SplitPdf />} />
          <Route path="/tools/compress" element={<CompressPdf />} />
          <Route path="/tools/rotate" element={<RotatePdf />} />
          <Route path="/tools/watermark" element={<WatermarkPdf />} />
          <Route path="/tools/pdf-to-word" element={<PdfToWord />} />
          <Route path="/tools/edit" element={<EditPdf />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
