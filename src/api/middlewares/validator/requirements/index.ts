import mainRequirement from './main';
import usersRequirement from './users';
import rolesRequirement from './roles';
import ordersRequirement from './orders';
import customerProfileRequirement from './customerProfile';

export default {
    ...mainRequirement,
    ...usersRequirement,
    ...rolesRequirement,
    ...ordersRequirement,
    ...customerProfileRequirement
};
