import mainRequirement from './main';
import usersRequirement from './users';
import rolesRequirement from './roles';
import ordersRequirement from './orders';
import customerProfileRequirement from './customerProfile';
import productRequirement from './product';

export default {
    ...mainRequirement,
    ...usersRequirement,
    ...rolesRequirement,
    ...ordersRequirement,
    ...productRequirement,
    ...customerProfileRequirement
};
