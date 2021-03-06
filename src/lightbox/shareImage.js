/* @flow strict-local */
import { Platform, Share } from 'react-native';

import downloadImage from './downloadImage';
import type { Auth } from '../types';
import ShareImageAndroid from '../nativeModules/ShareImageAndroid';
import { showToast } from '../utils/info';
import tryGetTemporaryFileUrl from '../api/tryGetFileDownloadUrl';
import { getFullUrl } from '../utils/url';
import openLink from '../utils/openLink';

export default async (url: string, auth: Auth) => {
  const tempUrl = await tryGetTemporaryFileUrl(url, auth);

  if (tempUrl === null) {
    showToast('Please share the image from your browser');
    openLink(getFullUrl(url, auth.realm));
    return;
  }

  if (Platform.OS === 'android') {
    const res: $FlowFixMe = await downloadImage(tempUrl, auth);
    await ShareImageAndroid.shareImage(res.path());
  } else {
    try {
      const uri = await downloadImage(tempUrl, auth);
      try {
        await Share.share({ url: uri, message: url });
      } catch (error) {
        showToast('Can not share');
      }
    } catch (error) {
      showToast('Can not download');
    }
  }
};
