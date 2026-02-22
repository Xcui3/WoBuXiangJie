// 推送通知模块
// 使用 @notifee/react-native
// 每晚22:00提醒用户签到

import notifee, {
  AndroidImportance,
  TriggerType,
  RepeatFrequency,
} from '@notifee/react-native';

export async function setupDailyReminder() {
  try {
    // 请求通知权限
    await notifee.requestPermission();

    // 创建通知频道（Android必须）
    const channelId = await notifee.createChannel({
      id: 'daily-checkin',
      name: '每日签到提醒',
      importance: AndroidImportance.HIGH,
    });

    // 设置每天22:00触发
    const date = new Date();
    date.setHours(22, 0, 0, 0);
    // 如果今天22点已过，从明天开始
    if (date.getTime() < Date.now()) {
      date.setDate(date.getDate() + 1);
    }

    // 取消旧的提醒
    await notifee.cancelAllNotifications();

    // 设置新的每日重复提醒
    await notifee.createTriggerNotification(
      {
        id: 'daily-checkin',
        title: '我不想戒',
        body: '当一天结束的时候，回顾今日。',
        android: {
          channelId,
          pressAction: {id: 'default'},
        },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: date.getTime(),
        repeatFrequency: RepeatFrequency.DAILY,
      },
    );
  } catch (e) {
    // 通知设置失败不影响主功能
    console.warn('通知设置失败:', e);
  }
}

export async function cancelReminder() {
  try {
    await notifee.cancelAllNotifications();
  } catch (e) {
    console.warn('取消通知失败:', e);
  }
}
