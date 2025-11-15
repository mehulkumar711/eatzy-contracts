import { Test, TestingModule } from '@nestjs/testing';
import { AuthServiceController } from './auth-service.controller';
import { AuthService } from './auth-service.service';

// Mock the real AuthService
const mockAuthService = {
  login: jest.fn(() => {
    return { access_token: 'mock-jwt-token' };
  }),
};

describe('AuthServiceController', () => {
  let authServiceController: AuthServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthServiceController],
      providers: [
        // Provide the mock service
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authServiceController = app.get<AuthServiceController>(AuthServiceController);
  });

  // This 'describe' block for 'getHello' should be deleted.
  // describe('root', () => {
  //   it('should return "Hello World!"', () => {
  //     // This line causes the error:
  //     expect(authServiceController.getHello()).toBe('Hello World!');
  //   });
  // });

  // This is the only test that matters:
  describe('login', () => {
    it('should return an access token', async () => {
      const loginDto = { phone: '+911234567890', pin: '1234' };
      const result = await authServiceController.login(loginDto);
      expect(result).toHaveProperty('access_token');
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });
  });
});