// 隐私政策页面
// 用 WebView 展示本地 HTML，或外链到托管 URL
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Linking,
} from 'react-native';

// 上线后将此 URL 改为真实托管地址（GitHub Pages / 自有域名）
const PRIVACY_URL = 'https://xcui3.github.io/privacy-policy.html';

interface Props {
  onBack: () => void;
}

export default function PrivacyScreen({onBack}: Props) {
  const openPrivacy = () => {
    Linking.openURL(PRIVACY_URL).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000"/>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>‹ 返回</Text>
        </TouchableOpacity>
        <Text style={styles.title}>隐私政策</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.appName}>我不想戒</Text>
        <Text style={styles.date}>生效日期：2026年3月1日</Text>

        <Text style={styles.intro}>
          本应用以最小化原则收集信息。所有数据存储于您设备本地，不上传至任何服务器。
          我们仅申请通知权限（用于每晚签到提醒），您可随时关闭。
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>我们收集的信息</Text>
          <Text style={styles.sectionBody}>您创建的戒断目标、签到记录，均仅存储在您的设备上。</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>通知权限</Text>
          <Text style={styles.sectionBody}>仅用于每晚 22:00 发送签到提醒。拒绝不影响核心功能。</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>信息共享</Text>
          <Text style={styles.sectionBody}>我们不向任何第三方出售或共享您的个人信息。</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>您的权利</Text>
          <Text style={styles.sectionBody}>您可随时在 App 内查阅、删除数据；卸载即注销全部数据。</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>未成年人</Text>
          <Text style={styles.sectionBody}>本应用面向 14 周岁及以上用户。</Text>
        </View>

        <TouchableOpacity style={styles.fullPolicyBtn} onPress={openPrivacy} activeOpacity={0.8}>
          <Text style={styles.fullPolicyText}>查看完整隐私政策 ↗</Text>
        </TouchableOpacity>

        <Text style={styles.contact}>联系我们：privacy@wobuxiangjie.app</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex:1, backgroundColor:'#000'},
  header: {
    flexDirection:'row',
    alignItems:'center',
    paddingHorizontal:20,
    paddingTop:12,
    paddingBottom:16,
    borderBottomWidth:1,
    borderColor:'#1a1a1a',
  },
  backBtn: {paddingRight:16, paddingVertical:4},
  backText: {color:'#ff9500', fontSize:18},
  title: {color:'#fff', fontSize:17, fontWeight:'600'},
  body: {flex:1, paddingHorizontal:24, paddingTop:28},
  appName: {color:'#fff', fontSize:22, fontWeight:'700', marginBottom:4},
  date: {color:'#444', fontSize:13, marginBottom:20},
  intro: {color:'#888', fontSize:14, lineHeight:22, marginBottom:24,
    padding:16, backgroundColor:'#111', borderRadius:12,
    borderLeftWidth:3, borderColor:'#ff9500'},
  section: {marginBottom:20},
  sectionTitle: {color:'#fff', fontSize:15, fontWeight:'600', marginBottom:6},
  sectionBody: {color:'#666', fontSize:14, lineHeight:22},
  fullPolicyBtn: {
    marginTop:16,
    paddingVertical:14,
    borderRadius:12,
    borderWidth:1,
    borderColor:'#ff9500',
    alignItems:'center',
  },
  fullPolicyText: {color:'#ff9500', fontSize:15, fontWeight:'600'},
  contact: {color:'#333', fontSize:12, textAlign:'center', marginTop:20},
});
