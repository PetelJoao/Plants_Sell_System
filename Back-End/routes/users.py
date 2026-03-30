from flask import Blueprint
users_bp = Blueprint('users', __name__)
from controllers.users_controllers import get_all, get_by_id, create,update,remove
from middlewares.auth import auth_required



users_bp.route('/',             methods=['GET']   )(auth_required(get_all))
users_bp.route('/<user_id>',    methods=['GET']   )(auth_required(get_by_id))
users_bp.route('/',             methods=['POST']  )(auth_required(create))
users_bp.route('/<user_id>',    methods=['PUT']   )(auth_required(update))
users_bp.route('/<user_id>',    methods=['DELETE'])(auth_required(remove))
