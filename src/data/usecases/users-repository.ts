import { UsersMongoRepository } from '@/infra/db/mongodb/repositories/users-mongo-repository';
import { IUsersInserManyInput } from '../protocols/db/dtos/users-repository.dto';
import { IPasswordsManager } from '@/src/domain/authenticators/passwords-manager';

export class UsersDbRepository {
  private readonly usersMongoRepository: UsersMongoRepository;
  private readonly passwordsManager: IPasswordsManager;

  constructor(
    usersMongoRepository: UsersMongoRepository, 
    passwordsManager: IPasswordsManager
  ) {
    this.usersMongoRepository = usersMongoRepository;
    this.passwordsManager = passwordsManager;
  }

  async insertMany(users: IUsersInserManyInput[], batchSize: number = 200): Promise<void> {
    const promises = [];
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
  
      const transformedUsers = await Promise.all(batch.map(async (user) => {
        const encodedPassword = await this.passwordsManager.hashPassword(this.generateDefaultPassword(user.email, user.phoneNumber));
        return {
          _id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          email: user.email,
          password: encodedPassword
        };
      }));

      promises.push(this.usersMongoRepository.insertMany(transformedUsers));
    }

    await Promise.all(promises);
    return; 
  }
  

  private generateDefaultPassword(
    email: string,
    phone:string,
  ){
    const digitsOnly = phone.replace(/\D/g, '');
    const firstThreeNumbers = digitsOnly.split('').slice(0, 3).join('');
    const newPassword = `${email}${firstThreeNumbers}`;

    return newPassword;
  }
}
