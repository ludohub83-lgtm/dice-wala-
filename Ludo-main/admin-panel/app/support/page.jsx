'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageSquare, CheckCircle, Clock, XCircle, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, orderBy, query, updateDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';

export default function SupportPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      
      const ticketsQuery = query(
        collection(db, 'supportTickets'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(ticketsQuery);
      const ticketsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setTickets(ticketsData);
    } catch (error) {
      console.error('Error loading tickets:', error);
      
      // If collection doesn't exist, create sample data
      if (error.code === 'permission-denied' || error.message.includes('indexes')) {
        toast.error('Support tickets collection not initialized. Creating...');
        try {
          await addDoc(collection(db, 'supportTickets'), {
            userId: 'system',
            userName: 'System',
            subject: 'Welcome to Support',
            message: 'Support ticket system is now active!',
            status: 'open',
            priority: 'low',
            createdAt: serverTimestamp(),
          });
          loadTickets();
        } catch (createError) {
          console.error('Error creating collection:', createError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      await updateDoc(doc(db, 'supportTickets', ticketId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      
      toast.success(`Ticket ${newStatus}`);
      loadTickets();
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast.error('Failed to update ticket');
    }
  };

  const sendReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;

    try {
      setSending(true);
      
      await updateDoc(doc(db, 'supportTickets', selectedTicket.id), {
        reply: replyText,
        repliedAt: serverTimestamp(),
        status: 'resolved',
      });
      
      toast.success('Reply sent successfully');
      setReplyText('');
      setSelectedTicket(null);
      loadTickets();
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'text-blue-400 bg-blue-400/20';
      case 'in-progress': return 'text-yellow-400 bg-yellow-400/20';
      case 'resolved': return 'text-green-400 bg-green-400/20';
      case 'closed': return 'text-gray-400 bg-gray-400/20';
      default: return 'text-white/60 bg-white/10';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <Clock size={16} />;
      case 'in-progress': return <MessageSquare size={16} />;
      case 'resolved': return <CheckCircle size={16} />;
      case 'closed': return <XCircle size={16} />;
      default: return <MessageSquare size={16} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          
          <div className="glass rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <MessageSquare className="text-purple-400" size={32} />
              <div>
                <h1 className="text-3xl font-bold text-white">Support Tickets</h1>
                <p className="text-gray-300">Manage user support requests</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tickets List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-6"
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto text-white/40 mb-4" size={48} />
              <p className="text-white/60">No support tickets yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket, index) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(ticket.status)}`}>
                          {getStatusIcon(ticket.status)}
                          {ticket.status}
                        </span>
                        <span className="text-white/60 text-sm">
                          {ticket.createdAt?.toDate?.().toLocaleDateString() || 'Recently'}
                        </span>
                      </div>
                      <h3 className="text-white font-bold text-lg mb-1">
                        {ticket.subject || 'No Subject'}
                      </h3>
                      <p className="text-white/70 mb-2">
                        {ticket.message?.substring(0, 150)}
                        {ticket.message?.length > 150 && '...'}
                      </p>
                      <p className="text-white/50 text-sm">
                        From: {ticket.userName || ticket.userId}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      {ticket.status === 'open' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateTicketStatus(ticket.id, 'in-progress');
                          }}
                          className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors"
                        >
                          Start
                        </button>
                      )}
                      {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateTicketStatus(ticket.id, 'resolved');
                          }}
                          className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Reply Modal */}
        {selectedTicket && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setSelectedTicket(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Ticket Details</h2>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-white/60 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-white/60 text-sm mb-1">Subject</p>
                  <p className="text-white font-bold text-lg">{selectedTicket.subject}</p>
                </div>
                
                <div>
                  <p className="text-white/60 text-sm mb-1">Message</p>
                  <p className="text-white">{selectedTicket.message}</p>
                </div>
                
                <div>
                  <p className="text-white/60 text-sm mb-1">From</p>
                  <p className="text-white">{selectedTicket.userName || selectedTicket.userId}</p>
                </div>
                
                {selectedTicket.reply && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <p className="text-white/60 text-sm mb-1">Admin Reply</p>
                    <p className="text-white">{selectedTicket.reply}</p>
                  </div>
                )}
              </div>

              {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                <div>
                  <label className="block text-white font-medium mb-2">Send Reply</label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 resize-none"
                  />
                  <button
                    onClick={sendReply}
                    disabled={sending || !replyText.trim()}
                    className="mt-4 w-full px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {sending ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Send Reply
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
