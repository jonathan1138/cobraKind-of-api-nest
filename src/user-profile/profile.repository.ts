import { Repository, EntityRepository } from 'typeorm';
import { Profile } from 'src/user-profile/profile.entity';

@EntityRepository(Profile)
export class ProfileRepository extends Repository<Profile> {

}
