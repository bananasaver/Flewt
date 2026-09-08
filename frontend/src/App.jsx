import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Landing from './pages/Landing.jsx';
import Tools from './pages/Tools.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import Pricing from './pages/Pricing.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Contact from './pages/Contact.jsx';
import Privacy from './pages/legal/Privacy.jsx';
import Cookies from './pages/legal/Cookies.jsx';
import Terms from './pages/legal/Terms.jsx';

import MergePdf from './pages/tools/MergePdf.jsx';
import SplitPdf from './pages/tools/SplitPdf.jsx';
import CompressPdf from './pages/tools/CompressPdf.jsx';
import RotatePdf from './pages/tools/RotatePdf.jsx';
import WatermarkPdf from './pages/tools/WatermarkPdf.jsx';
import PdfToWord from './pages/tools/PdfToWord.jsx';
import EditPdf from './pages/tools/EditPdf.jsx';
import RedactPdf from './pages/tools/RedactPdf.jsx';
import ComparePdfs from './pages/tools/ComparePdfs.jsx';
import ExtractFormData from './pages/tools/ExtractFormData.jsx';
import PasswordProtect from './pages/tools/PasswordProtect.jsx';
import OfficeToPdf from './pages/tools/OfficeToPdf.jsx';
import FillForm from './pages/tools/FillForm.jsx';
import DrawSign from './pages/tools/DrawSign.jsx';
import ScanCleanup from './pages/tools/ScanCleanup.jsx';
import VoiceToText from './pages/tools/VoiceToText.jsx';
import VoiceToPdf from './pages/tools/VoiceToPdf.jsx';
import ShrinkImage from './pages/tools/ShrinkImage.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/tools/:slug" element={<CategoryPage />} />

          {/* PDF Management */}
          <Route path="/tools/merge" element={<MergePdf />} />
          <Route path="/tools/split" element={<SplitPdf />} />
          <Route path="/tools/compress" element={<CompressPdf />} />
          <Route path="/tools/rotate" element={<RotatePdf />} />
          <Route path="/tools/watermark" element={<WatermarkPdf />} />
          <Route path="/tools/pdf-to-word" element={<PdfToWord />} />
          <Route path="/tools/edit" element={<EditPdf />} />
          <Route path="/tools/redact" element={<RedactPdf />} />
          <Route path="/tools/compare" element={<ComparePdfs />} />
          <Route path="/tools/extract-form-data" element={<ExtractFormData />} />
          <Route path="/tools/password-protect" element={<PasswordProtect />} />
          <Route path="/tools/office-to-pdf" element={<OfficeToPdf />} />

          {/* Document Management */}
          <Route path="/tools/fill-form" element={<FillForm />} />
          <Route path="/tools/sign" element={<DrawSign />} />
          <Route path="/tools/scan-cleanup" element={<ScanCleanup />} />

          {/* Speech to Text */}
          <Route path="/tools/voice-to-text" element={<VoiceToText />} />
          <Route path="/tools/voice-to-pdf" element={<VoiceToPdf />} />

          {/* Image Tools */}
          <Route path="/tools/shrink-image" element={<ShrinkImage />} />

          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/terms" element={<Terms />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
