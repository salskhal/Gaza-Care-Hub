# Gaza Care Hub 🏥

**Emergency Medical Triage System for Gaza Healthcare Workers**

Gaza Care Hub is a comprehensive, offline-first medical triage application designed specifically to support healthcare workers in Gaza during emergency situations. The system provides critical patient management, triage classification, and handover capabilities that work reliably even without internet connectivity.

## 🎯 Mission

Providing critical medical triage support for Gaza healthcare workers through a robust, accessible, and humanitarian-focused digital solution that prioritizes patient care and medical workflow efficiency.

## ✨ Key Features

### 🚨 **Intelligent Triage System**
- **Automatic Classification**: AI-powered triage level assignment (Critical, Urgent, Stable)
- **Symptom-Based Assessment**: Comprehensive symptom checklist with medical keywords
- **Priority Queue Management**: Real-time patient prioritization based on medical urgency
- **Visual Status Indicators**: Color-coded system following medical triage standards

### 📋 **Comprehensive Patient Management**
- **Gaza Hospital Form Structure**: Follows local medical documentation standards
- **Complete Medical Records**: Patient demographics, medical history, examination findings
- **Treatment Planning**: Provisional diagnosis and treatment plan documentation
- **Status Tracking**: Real-time patient status updates (Waiting, In Treatment, Treated, etc.)

### 🔄 **Shift Handover System**
- **Handover Notes**: Structured shift change documentation
- **Status Change Tracking**: Automatic logging of patient status modifications
- **Critical Updates Highlighting**: Important changes flagged for incoming staff
- **Action Items Management**: Task assignment for continuity of care

### 💾 **Offline-First Architecture**
- **IndexedDB Storage**: Complete offline functionality using browser database
- **Data Persistence**: All patient data stored locally and securely
- **Sync Capabilities**: Ready for future online synchronization features
- **Performance Optimized**: Designed for low-spec devices and limited resources

### 📊 **Dashboard & Analytics**
- **Real-Time Statistics**: Live patient counts by triage level
- **Search & Filtering**: Advanced patient search and filtering capabilities
- **Export Functionality**: CSV and JSON data export for reporting
- **Visual Indicators**: Intuitive UI with medical-standard color coding

## 🏗️ Technical Architecture

### **Frontend Stack**
- **React 19** - Modern UI framework with latest features
- **TypeScript** - Type-safe development for medical data integrity
- **Tailwind CSS 4** - Utility-first styling with custom medical theme
- **Vite** - Fast build tool optimized for development and production

### **Data Management**
- **Dexie.js** - IndexedDB wrapper for robust offline storage
- **Local-First Design** - All data stored client-side for reliability
- **Type-Safe Models** - Comprehensive TypeScript interfaces for medical data

### **Performance Optimization**
- **Low-Spec Device Support** - Optimized for resource-constrained environments
- **Virtualized Lists** - Efficient rendering of large patient lists
- **Debounced Interactions** - Smooth performance on slower devices
- **Code Splitting** - Optimized bundle loading for faster startup

### **Accessibility & UX**
- **WCAG 2.1 Compliance** - Accessible to users with disabilities
- **Mobile-First Design** - Responsive layout for tablets and phones
- **Keyboard Navigation** - Full keyboard accessibility support
- **Screen Reader Support** - Semantic HTML and ARIA labels

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- Modern web browser with IndexedDB support

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/gaza-care-hub.git
   cd gaza-care-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📱 Usage Guide

### **Adding New Patients**
1. Navigate to "Add Patient" page
2. Fill in patient demographics and medical information
3. Select relevant symptoms from the comprehensive checklist
4. System automatically assigns triage level based on symptoms
5. Submit to add patient to the queue

### **Managing Patient Queue**
1. View prioritized patient list on the Dashboard
2. Use search and filters to find specific patients
3. Click on patient cards to view detailed information
4. Update patient status as treatment progresses
5. Add treatment notes and observations

### **Shift Handover Process**
1. Access Handover page for shift change documentation
2. Review patients with status changes and critical updates
3. Add handover notes for specific patients requiring attention
4. Generate shift summary reports for incoming staff
5. Export handover data for record keeping

### **Data Export**
1. Navigate to Export page
2. Choose export format (CSV or JSON)
3. Select date range and patient filters
4. Download data for external reporting or backup

## 🏥 Medical Workflow Integration

### **Triage Classification**
The system uses medical-standard triage levels:

- **🔴 Critical**: Immediate life-threatening conditions requiring instant attention
- **🟡 Urgent**: Serious conditions requiring prompt medical care
- **🟢 Stable**: Non-urgent conditions that can wait for routine care

### **Patient Status Tracking**
- **Waiting**: Patient registered and waiting for assessment
- **In Treatment**: Currently receiving medical care
- **Treated**: Treatment completed, awaiting discharge/transfer
- **Discharged**: Patient released from care
- **Transferred**: Patient moved to another facility

### **Documentation Standards**
Following Gaza hospital emergency department protocols:
- Patient identification and demographics
- Chief complaint and presenting symptoms
- Medical history and examination findings
- Provisional diagnosis and treatment planning
- Handover notes and status tracking

## 🔧 Configuration

### **Branding Customization**
Edit `src/config.ts` to customize:
- Application name and tagline
- Color scheme and theming
- Medical facility information
- Triage classification rules

### **Performance Tuning**
Adjust settings in `vite.config.ts`:
- Bundle optimization for target devices
- Chunk splitting for better caching
- Development server configuration

## 🛡️ Security & Privacy

### **Data Protection**
- All patient data stored locally in browser
- No external data transmission without explicit user action
- Secure IndexedDB encryption support
- HIPAA-compliant data handling practices

### **Access Control**
- Browser-based access control
- Session management for multi-user environments
- Audit trail for data modifications
- Secure export functionality

## 🌐 Browser Support

### **Supported Browsers**
- **Chrome/Chromium** 80+
- **Firefox** 75+
- **Safari** 13+
- **Edge** 80+

### **Required Features**
- IndexedDB support
- ES2015+ JavaScript
- CSS Grid and Flexbox
- Service Worker support (for future PWA features)

## 🤝 Contributing

We welcome contributions from the medical and developer communities:

1. **Fork the repository**
2. **Create feature branch** (`git checkout -b feature/medical-enhancement`)
3. **Commit changes** (`git commit -m 'Add new triage feature'`)
4. **Push to branch** (`git push origin feature/medical-enhancement`)
5. **Open Pull Request**

### **Development Guidelines**
- Follow TypeScript best practices
- Maintain medical data integrity
- Write comprehensive tests
- Document medical workflow changes
- Ensure accessibility compliance

## 📋 Roadmap

### **Phase 1: Core Functionality** ✅
- Patient registration and triage
- Offline data storage
- Basic dashboard and queue management

### **Phase 2: Enhanced Features** 🚧
- Advanced handover system
- Comprehensive reporting
- Data export capabilities
- Performance optimizations

### **Phase 3: Advanced Integration** 📋
- Multi-facility synchronization
- Advanced analytics and insights
- Mobile app development
- Integration with medical devices

### **Phase 4: Scalability** 📋
- Cloud synchronization options
- Multi-language support
- Advanced security features
- Telemedicine integration

## 📞 Support & Contact



### **Technical Support**
For technical issues or development questions:
- GitHub Issues: [Report Bug/Request Feature](https://github.com/salskhal/Gaza-Care-Hub/issues)
- Email: olaniyisal@gmail.com


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Gaza Healthcare Workers** - For their dedication and feedback
- **Medical Advisory Board** - For clinical guidance and validation
- **Open Source Community** - For the tools and libraries that make this possible
- **Humanitarian Organizations** - For supporting healthcare technology initiatives

---

**Gaza Care Hub** - *Providing critical medical triage support for Gaza healthcare workers*

Built with ❤️ for the healthcare heroes of Gaza
