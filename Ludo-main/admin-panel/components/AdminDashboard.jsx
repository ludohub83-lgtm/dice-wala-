'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ScanLine,
  DollarSign,
  CheckCircle,
  XCircle,
  ArrowDownCircle,
  Search,
  Bell,
  MessageSquare,
  History,
  Settings,
  BarChart3,
  Phone,
  Gamepad2,
} from 'lucide-react';
import AdminButton from './AdminButton';
import StatsCard from './StatsCard';
import PendingPaymentsModal from './modals/PendingPaymentsModal';
import VerifiedPaymentsModal from './modals/VerifiedPaymentsModal';
import FakePaymentsModal from './modals/FakePaymentsModal';
import WithdrawRequestsModal from './modals/WithdrawRequestsModal';
import SearchUserModal from './modals/SearchUserModal';
import ChangeScannerModal from './modals/ChangeScannerModal';
import GameControlModal from './modals/GameControlModal';
import SupportRequestsModal from './modals/SupportRequestsModal';
import toast from 'react-hot-toast';

const ADMIN_MENU_ITEMS = [
  {
    id: 'gameControl',
    label: 'Game Control',
    icon: Gamepad2,
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    route: '/admin/game-control',
  },
  {
    id: 'scanner',
    label: 'Change Scanner',
    icon: ScanLine,
    gradient: 'from-purple-500 to-pink-500',
    route: '/admin/scanner',
  },
  {
    id: 'pending',
    label: 'Pending Payments',
    icon: DollarSign,
    gradient: 'from-pink-500 to-red-500',
    route: '/admin/pending-payments',
    badge: true,
  },
  {
    id: 'verified',
    label: 'Verified Payments',
    icon: CheckCircle,
    gradient: 'from-blue-500 to-cyan-500',
    route: '/admin/verified-payments',
  },
  {
    id: 'fake',
    label: 'Fake Payments',
    icon: XCircle,
    gradient: 'from-rose-500 to-yellow-500',
    route: '/admin/fake-payments',
  },
  {
    id: 'withdraw',
    label: 'Withdraw Requests',
    icon: ArrowDownCircle,
    gradient: 'from-cyan-500 to-purple-900',
    route: '/admin/withdraws',
    badge: true,
  },
  {
    id: 'search',
    label: 'Search User',
    icon: Search,
    gradient: 'from-teal-400 to-pink-300',
    route: '/admin/search',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    gradient: 'from-pink-400 to-purple-400',
    route: '/admin/notifications',
    badge: true,
  },
  {
    id: 'support',
    label: 'Support Requests',
    icon: MessageSquare,
    gradient: 'from-orange-300 to-pink-400',
    route: '/support',
    badge: true,
  },
  {
    id: 'users',
    label: 'Users & Stats',
    icon: Phone,
    gradient: 'from-green-400 to-blue-500',
    route: '/users',
  },
  {
    id: 'history',
    label: 'Payment History',
    icon: History,
    gradient: 'from-orange-400 to-pink-500',
    route: '/admin/history',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    gradient: 'from-blue-300 to-blue-600',
    route: '/admin/settings',
  },
  {
    id: 'reports',
    label: 'Reports & Analytics',
    icon: BarChart3,
    gradient: 'from-purple-300 to-yellow-300',
    route: '/admin/reports',
  },
  {
    id: 'whatsapp',
    label: 'Whatsapp / Contact',
    icon: Phone,
    gradient: 'from-green-500 to-green-700',
    route: '/admin/whatsapp',
  },
];

export default function AdminDashboard({ stats, loading, onRefresh }) {
  const [activeModal, setActiveModal] = useState(null);

  const getBadgeCount = (itemId) => {
    switch (itemId) {
      case 'pending':
        return stats.pendingPayments + stats.pendingManualPayments;
      case 'withdraw':
        return stats.pendingWithdraws;
      case 'notifications':
        return stats.totalNotifications;
      case 'support':
        return stats.openSupportTickets || 0;
      default:
        return 0;
    }
  };

  const handleMenuClick = (item) => {
    switch (item.id) {
      case 'gameControl':
        // Navigate to game controls page
        if (typeof window !== 'undefined') {
          window.location.href = '/game-controls';
        }
        break;
      case 'pending':
      case 'verified':
      case 'fake':
      case 'withdraw':
      case 'search':
      case 'scanner':
      case 'support':
        setActiveModal(item.id);
        break;
      case 'notifications':
        toast.success(`You have ${stats.totalNotifications} pending notifications`);
        break;
      case 'history':
        if (typeof window !== 'undefined') {
          window.location.href = '/history';
        }
        break;
      case 'settings':
        if (typeof window !== 'undefined') {
          window.location.href = '/settings';
        }
        break;
      case 'reports':
        if (typeof window !== 'undefined') {
          window.location.href = '/reports';
        }
        break;
      case 'whatsapp':
        window.open('https://wa.me/1234567890', '_blank');
        break;
      default:
        break;
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    onRefresh(); // Refresh stats when modal closes
  };

  return (
    <div className="min-h-screen p-4 md:p-8 safe-area-inset">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 md:mb-8"
      >
        <div className="glass rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-2xl">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-300 text-sm md:text-lg">
            Manage payments, users, and system settings
          </p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatsCard
          label="Pending Payments"
          value={stats.pendingPayments + stats.pendingManualPayments}
          color="from-pink-500 to-red-500"
          loading={loading}
        />
        <StatsCard
          label="Withdraw Requests"
          value={stats.pendingWithdraws}
          color="from-cyan-500 to-blue-600"
          loading={loading}
        />
        <StatsCard
          label="Total Notifications"
          value={stats.totalNotifications}
          color="from-purple-500 to-indigo-600"
          loading={loading}
        />
      </div>

      {/* Admin Menu Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {ADMIN_MENU_ITEMS.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            <AdminButton
              item={item}
              onClick={() => handleMenuClick(item)}
              badgeCount={getBadgeCount(item.id)}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Modals */}
      {activeModal === 'gameControl' && (
        <GameControlModal onClose={closeModal} />
      )}
      {activeModal === 'pending' && (
        <PendingPaymentsModal onClose={closeModal} />
      )}
      {activeModal === 'verified' && (
        <VerifiedPaymentsModal onClose={closeModal} />
      )}
      {activeModal === 'fake' && <FakePaymentsModal onClose={closeModal} />}
      {activeModal === 'withdraw' && (
        <WithdrawRequestsModal onClose={closeModal} />
      )}
      {activeModal === 'search' && <SearchUserModal onClose={closeModal} />}
      {activeModal === 'scanner' && <ChangeScannerModal onClose={closeModal} />}
      {activeModal === 'support' && <SupportRequestsModal isOpen={true} onClose={closeModal} />}
    </div>
  );
}

