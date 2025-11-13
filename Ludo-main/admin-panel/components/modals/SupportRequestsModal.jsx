'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Clock, CheckCircle, AlertCircle, Trash2, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SupportRequestsModal({ isOpen, onClose }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [response, setResponse] = useState('');
  const [filter, setFilter] = useState('all'); // all, open, in-progress, resolved

  useEffect(() => {
    if (isOpen) {
      fetchTickets();
    }
  }, [isOpen, filter]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const url = filter === 'all' 
        ? 'http://localhost:3000/support/tickets'
        : `http://localhost:3000/support/tickets?status=${filter}`;
      
      const response = await fetch(url);
      const data = await response.json();
      setTickets(data.tickets || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (ticketId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:3000/support/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success(`Ticket ${newStatus}`);
        fetchTickets();
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket(null);
        }
      }
    } catch (error) {
      toast.error('Failed to update ticket');
    }
  };

  const updatePriority = async (ticketId, newPriority) => {
    try {
      const response = await fetch(`http://localhost:3000/support/tickets/${ticketId}/priority`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: newPriority }),
      });

      if (response.ok) {
        toast.success(`Priority updated to ${newPriority}`);
        fetchTickets();
      }
    } catch (error) {
      toast.error('Failed to update priority');
    }
  };

  const sendResponse = async (ticketId) => {
    if (!response.trim()) {
      toast.error('Please enter a response');
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/support/tickets/${ticketId}/response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response }),
      });

      if (res.ok) {
        toast.success('Response sent');
        setResponse('');
        fetchTickets();
      }
    } catch (error) {
      toast.error('Failed to send response');
    }
  };

  const deleteTicket = async (ticketId) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;

    try {
      const response = await fetch(`http://localhost:3000/support/tickets/${ticketId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Ticket deleted');
        fetchTickets();
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket(null);
        }
      }
    } catch (error) {
      toast.error('Failed to delete ticket');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-yellow-500';
      case 'in-progress': return 'bg-blue-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'text-green-400';
      case 'normal': return 'text-blue-400';
      case 'high': return 'text-orange-400';
      case 'urgent': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-6xl max-h-[90vh] bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-2xl shadow-2xl border border-purple-500/20 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-purple-500/20">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Support Requests</h2>
              <span className="px-3 py-1 text-sm font-semibold text-white bg-purple-500/30 rounded-full">
                {tickets.length} Total
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 transition-colors hover:text-white hover:bg-white/10 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 p-4 border-b border-purple-500/20">
            {['all', 'open', 'in-progress', 'resolved'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === f
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex h-[calc(90vh-180px)]">
            {/* Tickets List */}
            <div className="w-1/2 overflow-y-auto border-r border-purple-500/20">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : tickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
                  <p>No support tickets found</p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {tickets.map((ticket) => (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg cursor-pointer transition-all ${
                        selectedTicket?.id === ticket.id
                          ? 'bg-purple-500/20 border-2 border-purple-500'
                          : 'bg-white/5 hover:bg-white/10 border-2 border-transparent'
                      }`}
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">{ticket.subject}</h3>
                          <p className="text-sm text-gray-400">User ID: {ticket.userId}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 line-clamp-2">{ticket.message}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(ticket.createdAt).toLocaleString()}
                        </span>
                        <span className={`font-semibold ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority.toUpperCase()}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Ticket Details */}
            <div className="w-1/2 overflow-y-auto">
              {selectedTicket ? (
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{selectedTicket.subject}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>Ticket #{selectedTicket.id}</span>
                      <span>User ID: {selectedTicket.userId}</span>
                      <span>{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-gray-300">{selectedTicket.message}</p>
                  </div>

                  {selectedTicket.adminResponse && (
                    <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                      <p className="text-sm font-semibold text-purple-400 mb-2">Admin Response:</p>
                      <p className="text-gray-300">{selectedTicket.adminResponse}</p>
                    </div>
                  )}

                  {/* Priority Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Priority</label>
                    <div className="flex gap-2">
                      {['low', 'normal', 'high', 'urgent'].map((p) => (
                        <button
                          key={p}
                          onClick={() => updatePriority(selectedTicket.id, p)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                            selectedTicket.priority === p
                              ? 'bg-purple-500 text-white'
                              : 'bg-white/5 text-gray-400 hover:bg-white/10'
                          }`}
                        >
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Response Input */}
                  {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Send Response</label>
                      <textarea
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        placeholder="Type your response..."
                        className="w-full p-3 bg-white/5 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                        rows="4"
                      />
                      <button
                        onClick={() => sendResponse(selectedTicket.id)}
                        className="mt-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Send Response
                      </button>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {selectedTicket.status === 'open' && (
                      <button
                        onClick={() => updateStatus(selectedTicket.id, 'in-progress')}
                        className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                      >
                        Mark In Progress
                      </button>
                    )}
                    {(selectedTicket.status === 'open' || selectedTicket.status === 'in-progress') && (
                      <button
                        onClick={() => updateStatus(selectedTicket.id, 'resolved')}
                        className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark Resolved
                      </button>
                    )}
                    <button
                      onClick={() => deleteTicket(selectedTicket.id)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <AlertCircle className="w-16 h-16 mb-4 opacity-50" />
                  <p>Select a ticket to view details</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
