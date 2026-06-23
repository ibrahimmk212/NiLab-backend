import UserRepository from '../UserRepository';
import UserModel from '../../models/User';

// Mock User Model
jest.mock('../../models/User', () => {
    const mockSave = jest.fn();
    const mockUserInstance = {
        save: mockSave
    };

    const mockSelect = jest.fn().mockReturnThis();
    const mockPopulate = jest.fn().mockReturnThis();
    const mockSort = jest.fn().mockReturnThis();
    const mockSkip = jest.fn().mockReturnThis();
    const mockLimit = jest.fn().mockReturnThis();
    
    // For query chaining
    const mockQuery = {
        select: mockSelect,
        populate: mockPopulate,
        sort: mockSort,
        skip: mockSkip,
        limit: mockLimit,
        then: jest.fn(),
        catch: jest.fn()
    };

    // A helper to make mockQuery thenable/awaitable
    const makeQueryAwaitable = (resolvedValue: any) => {
        const query = { ...mockQuery };
        (query as any).then = (resolve: any) => resolve(resolvedValue);
        return query;
    };

    const mockModel: any = jest.fn().mockImplementation(() => mockUserInstance);
    mockModel.findById = jest.fn();
    mockModel.find = jest.fn();
    mockModel.findOne = jest.fn();
    mockModel.findByIdAndUpdate = jest.fn();
    mockModel.findByIdAndDelete = jest.fn();
    mockModel.countDocuments = jest.fn();
    
    return {
        __esModule: true,
        default: mockModel,
        mockUserInstance,
        mockSave,
        mockSelect,
        mockPopulate,
        mockSort,
        mockSkip,
        mockLimit,
        makeQueryAwaitable
    };
});

describe('UserRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createUser', () => {
        it('should create a user', async () => {
            const userData = { email: 'test@example.com', firstName: 'Test' };
            const mockSavedUser = { ...userData, _id: '123' };
            
            const { mockSave } = require('../../models/User');
            mockSave.mockResolvedValue(mockSavedUser);

            const result = await UserRepository.createUser(userData);

            expect(result).toEqual(mockSavedUser);
            expect(UserModel).toHaveBeenCalledWith(userData);
            expect(mockSave).toHaveBeenCalledTimes(1);
        });
    });

    describe('findUserById', () => {
        it('should find user by ID and populate wallet', async () => {
            const userId = '123';
            const mockUser = { _id: userId, email: 'test@example.com' };
            
            const { makeQueryAwaitable } = require('../../models/User');
            const query = makeQueryAwaitable(mockUser);
            (UserModel.findById as jest.Mock).mockReturnValue(query);

            const result = await UserRepository.findUserById(userId);

            expect(result).toEqual(mockUser);
            expect(UserModel.findById).toHaveBeenCalledWith(userId);
            expect(query.select).toHaveBeenCalled();
            expect(query.populate).toHaveBeenCalledWith('wallet');
        });
    });

    describe('findAll', () => {
        it('should find all users with pagination', async () => {
            const mockUsers = [{ _id: '123', email: 'test@example.com' }];
            const mockTotal = 1;
            
            const { makeQueryAwaitable } = require('../../models/User');
            const query = makeQueryAwaitable(mockUsers);
            (UserModel.find as jest.Mock).mockReturnValue(query);
            (UserModel.countDocuments as jest.Mock).mockResolvedValue(mockTotal);

            const result = await UserRepository.findAll({ page: 1, limit: 10, role: 'user' });

            expect(result).toEqual({
                total: mockTotal,
                count: mockUsers.length,
                pagination: {
                    page: 1,
                    limit: 10,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPrevPage: false
                },
                data: mockUsers
            });
            expect(UserModel.find).toHaveBeenCalledWith({ role: 'user' });
            expect(UserModel.countDocuments).toHaveBeenCalledWith({ role: 'user' });
            expect(query.sort).toHaveBeenCalledWith({ createdAt: -1 });
            expect(query.skip).toHaveBeenCalledWith(0);
            expect(query.limit).toHaveBeenCalledWith(10);
        });
    });

    describe('findUserByEmail', () => {
        it('should find user by email and populate kyc and wallet', async () => {
            const email = 'test@example.com';
            const mockUser = { _id: '123', email };
            
            const { makeQueryAwaitable } = require('../../models/User');
            const query = makeQueryAwaitable(mockUser);
            (UserModel.findOne as jest.Mock).mockReturnValue(query);

            const result = await UserRepository.findUserByEmail(email);

            expect(result).toEqual(mockUser);
            expect(UserModel.findOne).toHaveBeenCalledWith({ email });
            expect(query.select).toHaveBeenCalledWith('+password');
            expect(query.populate).toHaveBeenCalledWith('kyc wallet');
        });
    });

    describe('updateUser', () => {
        it('should update a user by ID', async () => {
            const userId = '123';
            const updateData = { firstName: 'Updated' };
            const mockUpdatedUser = { _id: userId, ...updateData };

            (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedUser);

            const result = await UserRepository.updateUser(userId, updateData);

            expect(result).toEqual(mockUpdatedUser);
            expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(userId, updateData, { new: true });
        });
    });

    describe('deleteUser', () => {
        it('should delete a user by ID', async () => {
            const userId = '123';
            const mockDeletedUser = { _id: userId };

            (UserModel.findByIdAndDelete as jest.Mock).mockResolvedValue(mockDeletedUser);

            const result = await UserRepository.deleteUser(userId);

            expect(result).toEqual(mockDeletedUser);
            expect(UserModel.findByIdAndDelete).toHaveBeenCalledWith(userId, { new: true });
        });
    });
});
