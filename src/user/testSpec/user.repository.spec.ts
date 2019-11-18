import { UserRepository } from '../user.repository';
import { Test } from '@nestjs/testing';
import { ConflictException, InternalServerErrorException, NotFoundException, Logger } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

const mockCredentialsDto = {
                            name: 'TestUserName', password: 'TestPassword',
                            bio: 'TestBio', email: 'test@test.com',
                            avatar: 'TestImage' };

const mockImage = '3a9260c1-e0dc-4bb6-b3b5-10c782f2482e.gif';

describe('UserRepository', () => {
    let userRepository;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                UserRepository,
            ],
        }).compile();

        userRepository = await module.get<UserRepository>(UserRepository);
    });

    describe('signUp', () => {
        let save: jest.Mock<any, any>;

        beforeEach(() => {
            save = jest.fn();
            userRepository.create = jest.fn().mockReturnValue({save});
        });

        it('successfully signs up the user', () => {
            save.mockResolvedValue(undefined);
            expect(userRepository.signUp(mockCredentialsDto)).resolves.not.toThrow();
        });

        it('throws a conflict exception as name already exists', () => {
            save.mockResolvedValue( {code: '23505' });
            expect(userRepository.signUp(mockCredentialsDto).catch(err => Logger.error(err))).rejects.toThrow(ConflictException);
        });

        it('throws an internal server error', () => {
            save.mockResolvedValue( {code: '11381138' });
            expect(userRepository.signUp(mockCredentialsDto).catch(err => Logger.error(err))).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('validateUserPassword', () => {
        let user;

        beforeEach(() => {
            userRepository.findOne = jest.fn();
            user = new UserEntity();
            user.name = 'TestUserName';
            user.validatePassword = jest.fn();
        });

        it('returns the name as validation is successful', async () => {
            userRepository.findOne.mockResolvedValue(user);
            user.validatePassword.mockResolvedValue(true);
            const result = await userRepository.validateUserPassword(mockCredentialsDto);
            expect(result).toEqual('TestUserName');
        });

        it('returns null as user cannot be found', async () => {
            userRepository.findOne.mockResolvedValue(null);
            const result = await userRepository.validateUserPassword(mockCredentialsDto);
            expect(user.validatePassword).not.toHaveBeenCalled();
            expect(result).toBeNull();
        });

        it('returns null as password is invalid', async () => {
            userRepository.findOne.mockResolvedValue(user);
            user.validatePassword.mockResolvedValue(false);
            const result = await userRepository.validateUserPassword(mockCredentialsDto);
            expect(user.validatePassword).toHaveBeenCalled();
            expect(result).toBeNull();
        });
    });

    describe('hashPassword', () => {
        it('calls bcrypy.hash to generate a hash', async () => {
            bcrypt.hash = jest.fn().mockResolvedValue('testHash');
            expect(bcrypt.hash).not.toHaveBeenCalled();
            const result = await userRepository.hashPassword('testPassword', 'testSalt');
            expect(bcrypt.hash).toHaveBeenCalledWith('testPassword', 'testSalt');
            expect(result).toEqual('testHash');
        });
    });

    describe('updateAvatar', () => {
        let save: jest.Mock<any, any>;

        beforeEach(() => {
            save = jest.fn();
            userRepository.create = jest.fn().mockReturnValue({save});
        });

        it('successfully uploads an image', () => {
            save.mockResolvedValue(mockImage);
            expect(userRepository.updateAvatar(mockImage)).resolves.not.toThrow();
        });
    });
});
