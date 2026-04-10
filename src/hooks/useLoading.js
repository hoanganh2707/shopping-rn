import { useDispatch } from 'react-redux';
import { appActions } from '~/redux';

export const useLoading = () => {
  const dispatch = useDispatch();

  const showLoading = () => {
    dispatch(appActions.changeLoading(true));
  };

  const hideLoading = () => {
    dispatch(appActions.changeLoading(false));
  };

  return {
    showLoading,
    hideLoading,
  };
};
