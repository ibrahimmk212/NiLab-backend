import ComplaintRepository from '../repositories/ComplaintRepository';
import { IComplaint } from '../models/Complaint';
import NotificationService from './NotificationService';
import UserRepository from '../repositories/UserRepository';
import OrderRepository from '../repositories/OrderRepository';

class ComplaintService {
    async createComplaint(userId: string, data: any): Promise<IComplaint> {
        // Validate Order if provided
        if (data.order) {
            const order = await OrderRepository.findOrderById(data.order);
            if (!order) throw new Error('Order not found');
            if (order.user._id.toString() !== userId) {
                throw new Error('This order does not belong to you');
            }
        }

        const complaint = await ComplaintRepository.create({
            ...data,
            user: userId
        });

        // Notify Admins
        const user = await UserRepository.findUserById(userId);
        const userName = user ? `${user.firstName} ${user.lastName}` : 'A customer';
        
        await NotificationService.notifyAdmins(
            'New Complaint Received',
            `${userName} submitted a complaint: ${data.subject}`
        );

        return complaint;
    }

    async resolveComplaint(
        complaintId: string,
        adminId: string,
        resolution: string,
        status: 'resolved' | 'rejected' = 'resolved'
    ): Promise<IComplaint | null> {
        const complaint = await ComplaintRepository.findById(complaintId);
        if (!complaint) throw new Error('Complaint not found');

        const updated = await ComplaintRepository.update(complaintId, {
            status,
            resolution,
            resolvedBy: adminId as any
        });

        // Notify User
        await NotificationService.create({
            userId: complaint.user._id as any,
            title: `Complaint ${status === 'resolved' ? 'Resolved' : 'Update'}`,
            message: `Your complaint "${complaint.subject}" has been ${status}. ${resolution}`,
            status: 'unread'
        });

        return updated;
    }

    async getComplaintById(id: string): Promise<IComplaint | null> {
        return await ComplaintRepository.findById(id);
    }

    async getUserComplaints(userId: string, query: any): Promise<any> {
        return await ComplaintRepository.findAll({ ...query, user: userId });
    }

    async getAllComplaints(query: any): Promise<any> {
        return await ComplaintRepository.findAll(query);
    }

    async updateStatus(id: string, status: string): Promise<IComplaint | null> {
         return await ComplaintRepository.update(id, { status: status as any });
    }

    async notifyVendorAboutComplaint(complaintId: string, message?: string): Promise<void> {
        const complaint = await ComplaintRepository.findById(complaintId);
        if (!complaint) throw new Error('Complaint not found');
        if (!complaint.order) throw new Error('Complaint is not linked to an order');

        const order = await OrderRepository.findOrderById(complaint.order.toString());
        if (!order || !order.vendor) throw new Error('Vendor not found for this order');

        await NotificationService.notifyVendor(
            order.vendor._id.toString(),
            'Complaint Alert',
            message || `Complaint linked to Order ${order.code}: ${complaint.subject}. Please contact Admin.`
        );
    }
}

export default new ComplaintService();
