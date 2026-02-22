import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  StatusBar,
  SafeAreaView,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {setupDailyReminder} from './src/notifications';

const {width} = Dimensions.get('window');

interface Goal {
  id: string;
  name: string;
  startDate: string;
  days: number;
  failCount: number;
  lastCheckIn: string | null;
  witnessedAt: number | null;
  checkedInToday: boolean;
  letterToSelf?: string;
}

const DAILY_QUOTES = [
  '今天没破防，已经很厉害了。',
  '戒不掉也没关系，至少你知道自己在戒。',
  '坚持这件事，从来都是悄悄的。',
  '你的见证者今天也没放弃，和你一样。',
  '躺平可以，但签到先。',
  '再难熬的夜晚，也会变成明天早上。',
  '不是戒不掉，是还没找到戒掉的理由。今天算一个。',
  '失败了也没关系，重置就是重新开始的另一种说法。',
  '有人在看着你，不是为了监督，是因为也在挣扎。',
  '今天又是战胜昨天那个自己的一天。',
  '你戒的那个东西，没你以为的那么需要你。',
  '慢慢来，反正也没人催。',
  '不是不想要，是更想要另一件事。',
  '见证者已经睡了，但他今天也签到了。',
  '每一个第X天，都是你赢的证据。',
  '不破防，不崩溃，就是今天最大的成就。',
  '戒掉的那天你会记得，今晚签到这件小事。',
  '有些东西戒掉之后，你才发现自己其实不需要它。',
  '明天的你，会感谢今晚签到的你。',
  '不想戒，但在戒。这已经很了不起了。',
];

function getDailyQuote(letterToSelf?: string): string {
  // 每3天轮一次自己的话，其余时间用鸡汤
  const day = new Date().getDate();
  if (letterToSelf && day % 3 === 0) return letterToSelf;
  return DAILY_QUOTES[day % DAILY_QUOTES.length];
}

function getWitnessText(witnessedAt: number | null): string | null {
  if (!witnessedAt) return null;
  const now = Date.now();
  const diff = now - witnessedAt;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  if (minutes < 5) return null;
  if (minutes < 60) return `见证者 ${minutes} 分钟前看了你的签到`;
  if (hours < 24) return `见证者 ${hours} 小时前看了你的签到`;
  return `见证者昨天看了你的签到`;
}

// 单个目标卡片
function GoalCard({goal, onCheckIn, onFail, onDelete}: {
  goal: Goal;
  onCheckIn: () => void;
  onFail: () => void;
  onDelete: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const cardBgAnim = useRef(new Animated.Value(0)).current;
  const successTextAnim = useRef(new Animated.Value(0)).current;
  const [showSuccess, setShowSuccess] = useState(false);

  const witnessText = getWitnessText(goal.witnessedAt);

  const handleCheckIn = () => {
    const today = new Date().toDateString();
    if (goal.lastCheckIn === today) {
      Alert.alert('今天签到过了', '明天再来。');
      return;
    }

    // 触发动效
    setShowSuccess(true);

    // 数字弹跳
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.25,
        duration: 200,
        easing: Easing.out(Easing.back(2)),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.elastic(1.2)),
        useNativeDriver: true,
      }),
    ]).start();

    // 光晕扩散
    Animated.timing(glowAnim, {
      toValue: 1,
      duration: 900,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      glowAnim.setValue(0);
    });

    // 卡片背景暖化
    Animated.sequence([
      Animated.timing(cardBgAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.delay(800),
      Animated.timing(cardBgAnim, {
        toValue: 0,
        duration: 1200,
        easing: Easing.in(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start();

    // 成功文字淡入
    Animated.sequence([
      Animated.timing(successTextAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(successTextAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => setShowSuccess(false));

    onCheckIn();
  };

  const cardBg = cardBgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#111111', '#1a1200'],
  });

  const cardBorder = cardBgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#1e1e1e', '#3a2800'],
  });

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 2.5],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 0.35, 0],
  });

  return (
    <Animated.View style={[styles.card, {backgroundColor: cardBg, borderColor: cardBorder}]}>
      {/* 光晕层 */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.glowCircle,
          {
            opacity: glowOpacity,
            transform: [{scale: glowScale}],
          },
        ]}
      />

      <View style={styles.cardTop}>
        <Text style={styles.goalLabel}>戒</Text>
        <Text style={styles.goalName}>{goal.name}</Text>
        <TouchableOpacity onPress={onDelete} style={styles.deleteArea}>
          <Text style={styles.deleteBtn}>×</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.daysRow}>
        <Animated.Text style={[styles.daysNum, {transform: [{scale: scaleAnim}]}]}>
          {goal.days}
        </Animated.Text>
        <Text style={styles.daysUnit}>天</Text>
      </View>

      {/* 成功提示 */}
      {showSuccess && (
        <Animated.Text style={[styles.successText, {opacity: successTextAnim}]}>
          今天做到了。
        </Animated.Text>
      )}

      <View style={styles.metaRow}>
        {goal.failCount > 0 && (
          <Text style={styles.failMeta}>失败 {goal.failCount} 次</Text>
        )}
        {witnessText && (
          <Text style={styles.witnessedMeta}>{witnessText}</Text>
        )}
        {goal.witnessedAt && !witnessText && (
          <Text style={styles.witnessedPending}>见证者即将查看...</Text>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.checkInBtn, goal.checkedInToday && styles.checkInBtnDone]}
          onPress={handleCheckIn}
          activeOpacity={0.8}>
          <Text style={[styles.checkInText, goal.checkedInToday && styles.checkInTextDone]}>
            {goal.checkedInToday ? '✓ 已签到' : '今天签到'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.failBtn} onPress={onFail} activeOpacity={0.8}>
          <Text style={styles.failBtnText}>我失败了</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

// 戒断日历组件
function CheckInCalendar({goal}: {goal: Goal}) {
  // 生成过去28天的签到记录（简化版：根据天数推算）
  const days = Array.from({length: 28}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (27 - i));
    return {
      date: d,
      checked: i >= 28 - goal.days && goal.days > 0,
    };
  });

  return (
    <View style={styles.calendar}>
      <Text style={styles.calendarTitle}>过去 28 天</Text>
      <View style={styles.calendarGrid}>
        {days.map((d, i) => (
          <View
            key={i}
            style={[
              styles.calendarDot,
              d.checked && styles.calendarDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

export default function App() {
  const [screen, setScreen] = useState<'onboarding' | 'main'>('onboarding');
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalLetter, setNewGoalLetter] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkFirstLaunch();
    setupDailyReminder().catch(() => {}); // 请求权限 + 设置每日22:00提醒
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const checkFirstLaunch = async () => {
    const launched = await AsyncStorage.getItem('launched');
    if (launched) {
      setScreen('main');
      loadGoals();
    }
  };

  const loadGoals = async () => {
    try {
      const data = await AsyncStorage.getItem('goals');
      if (data) setGoals(JSON.parse(data));
    } catch (e) {}
  };

  const saveGoals = async (updated: Goal[]) => {
    await AsyncStorage.setItem('goals', JSON.stringify(updated));
    setGoals(updated);
  };

  const finishOnboarding = async () => {
    await AsyncStorage.setItem('launched', '1');
    setScreen('main');
    loadGoals();
  };

  const addGoal = async () => {
    if (!newGoalName.trim()) return;
    const goal: Goal = {
      id: Date.now().toString(),
      name: newGoalName.trim(),
      startDate: new Date().toISOString(),
      days: 0,
      failCount: 0,
      lastCheckIn: null,
      witnessedAt: null,
      checkedInToday: false,
      letterToSelf: newGoalLetter.trim() || undefined,
    };
    await saveGoals([...goals, goal]);
    setNewGoalName('');
    setNewGoalLetter('');
    setModalVisible(false);
  };

  const checkIn = async (id: string) => {
    const today = new Date().toDateString();
    const updated = goals.map(g => {
      if (g.id !== id) return g;
      if (g.lastCheckIn === today) return g;
      const delay = (30 + Math.floor(Math.random() * 60)) * 60 * 1000;
      return {
        ...g,
        days: g.days + 1,
        lastCheckIn: today,
        witnessedAt: Date.now() + delay,
        checkedInToday: true,
      };
    });
    await saveGoals(updated);
  };

  const fail = async (id: string) => {
    Alert.alert('', '承认失败，重新开始？', [
      {text: '还没有', style: 'cancel'},
      {
        text: '是的',
        style: 'destructive',
        onPress: async () => {
          const updated = goals.map(g =>
            g.id === id
              ? {...g, days: 0, failCount: g.failCount + 1, lastCheckIn: null, witnessedAt: null, checkedInToday: false}
              : g,
          );
          await saveGoals(updated);
        },
      },
    ]);
  };

  const deleteGoal = (id: string) => {
    Alert.alert('', '删除这个目标？', [
      {text: '取消', style: 'cancel'},
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          await saveGoals(goals.filter(g => g.id !== id));
          if (selectedGoal === id) setSelectedGoal(null);
        },
      },
    ]);
  };

  const onboardingSteps = [
    {
      title: '你不是\n一个人在戒。',
      body: '此刻，有另一个人也在戒着什么。\n也许是奶茶，也许是某段感情。\n你们互不相识，但彼此见证。',
      btn: '继续',
    },
    {
      title: '同路人，\n不需要说话。',
      body: '研究表明，知道有人和你一起挣扎，\n坚持下去的概率会提高三倍。\n\n不是因为被监督，而是因为——\n不孤独。',
      btn: '继续',
    },
    {
      title: '准备好了吗？',
      body: '当一天结束的时候，回顾今日。\n\n告诉我你想戒掉什么。\n你的见证者，也在戒着他的。\n\n我们一起。',
      btn: '开始',
    },
  ];

  if (screen === 'onboarding') {
    const step = onboardingSteps[onboardingStep];
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <Animated.View style={[styles.onboarding, {opacity: fadeAnim}]}>
          <View style={styles.onboardingContent}>
            <Text style={styles.onboardingStep}>{onboardingStep + 1} / {onboardingSteps.length}</Text>
            <Text style={styles.onboardingTitle}>{step.title}</Text>
            <Text style={styles.onboardingBody}>{step.body}</Text>
          </View>
          <TouchableOpacity
            style={styles.onboardingBtn}
            onPress={() => {
              if (onboardingStep < onboardingSteps.length - 1) {
                Animated.sequence([
                  Animated.timing(fadeAnim, {toValue: 0, duration: 200, useNativeDriver: true}),
                ]).start(() => {
                  setOnboardingStep(onboardingStep + 1);
                  Animated.timing(fadeAnim, {toValue: 1, duration: 400, useNativeDriver: true}).start();
                });
              } else {
                finishOnboarding();
              }
            }}
            activeOpacity={0.8}>
            <Text style={styles.onboardingBtnText}>{step.btn}</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

  const currentGoal = goals.find(g => g.id === selectedGoal);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <View style={styles.header}>
        <Text style={styles.title}>我不想戒</Text>
        <Text style={styles.subtitle}>但我在戒。</Text>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}>
        {goals.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>还没有目标</Text>
            <Text style={styles.emptyHint}>点右下角 "+"，开始你的戒断之旅</Text>
          </View>
        )}
        {goals.map(goal => (
          <View key={goal.id}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => setSelectedGoal(selectedGoal === goal.id ? null : goal.id)}>
              <GoalCard
                goal={goal}
                onCheckIn={() => checkIn(goal.id)}
                onFail={() => fail(goal.id)}
                onDelete={() => deleteGoal(goal.id)}
              />
            </TouchableOpacity>
            {selectedGoal === goal.id && (
              <CheckInCalendar goal={goal} />
            )}
          </View>
        ))}

        <View style={styles.sleepHint}>
          <Text style={styles.sleepHintText}>{getDailyQuote(goals[0]?.letterToSelf)}</Text>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}>
        <Text style={styles.addBtnText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>我想戒掉</Text>
            <TextInput
              style={styles.input}
              placeholder="奶茶、熬夜、前任..."
              placeholderTextColor="#444"
              value={newGoalName}
              onChangeText={setNewGoalName}
              autoFocus
              maxLength={20}
            />
            <Text style={styles.modalLetterLabel}>✉️ 写给未来的自己（选填）</Text>
            <TextInput
              style={[styles.input, styles.letterInput]}
              placeholder="未来的我，你做到了。"
              placeholderTextColor="#3a3a3a"
              value={newGoalLetter}
              onChangeText={setNewGoalLetter}
              maxLength={60}
              multiline
            />
            <TouchableOpacity
              style={[styles.confirmBtn, !newGoalName.trim() && styles.confirmBtnDisabled]}
              onPress={addGoal}
              activeOpacity={0.8}>
              <Text style={styles.confirmText}>开始戒</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {setModalVisible(false); setNewGoalName(''); setNewGoalLetter('');}}>
              <Text style={styles.cancelText}>算了</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#000'},
  onboarding: {flex: 1, paddingHorizontal: 32, justifyContent: 'space-between', paddingBottom: 48, paddingTop: 80},
  onboardingContent: {flex: 1, justifyContent: 'center'},
  onboardingStep: {fontSize: 13, color: '#333', marginBottom: 32, letterSpacing: 2},
  onboardingTitle: {fontSize: 42, fontWeight: '700', color: '#fff', lineHeight: 54, marginBottom: 32, letterSpacing: -0.5},
  onboardingBody: {fontSize: 16, color: '#666', lineHeight: 30},
  onboardingBtn: {backgroundColor: '#fff', borderRadius: 16, paddingVertical: 18, alignItems: 'center'},
  onboardingBtnText: {color: '#000', fontWeight: '700', fontSize: 16},
  header: {paddingHorizontal: 28, paddingTop: 20, paddingBottom: 8},
  title: {fontSize: 36, fontWeight: '700', color: '#fff', letterSpacing: -0.5},
  subtitle: {fontSize: 15, color: '#555', marginTop: 2, letterSpacing: 0.5},
  list: {flex: 1},
  listContent: {paddingHorizontal: 20, paddingTop: 16, paddingBottom: 120},
  emptyContainer: {marginTop: 100, alignItems: 'center'},
  emptyTitle: {color: '#333', fontSize: 18, fontWeight: '600'},
  emptyHint: {color: '#2a2a2a', fontSize: 14, marginTop: 8},
  card: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 4,
    borderWidth: 1,
    overflow: 'hidden',
  },
  glowCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ff9500',
    alignSelf: 'center',
    top: 40,
  },
  cardTop: {flexDirection: 'row', alignItems: 'center', marginBottom: 16},
  goalLabel: {fontSize: 13, color: '#555', marginRight: 6, letterSpacing: 1},
  goalName: {fontSize: 17, fontWeight: '600', color: '#fff', flex: 1},
  deleteArea: {padding: 4},
  deleteBtn: {color: '#333', fontSize: 22, lineHeight: 22},
  daysRow: {flexDirection: 'row', alignItems: 'flex-end', marginBottom: 4},
  daysNum: {fontSize: 72, fontWeight: '700', color: '#fff', lineHeight: 76, letterSpacing: -2},
  daysUnit: {fontSize: 20, color: '#555', marginBottom: 10, marginLeft: 6},
  successText: {fontSize: 15, color: '#ff9500', marginBottom: 8, fontWeight: '500'},
  metaRow: {marginBottom: 20, minHeight: 18},
  failMeta: {fontSize: 13, color: '#444'},
  witnessedMeta: {fontSize: 13, color: '#5a8a5a', marginTop: 4},
  witnessedPending: {fontSize: 13, color: '#3a3a2a', marginTop: 4},
  actions: {flexDirection: 'row', gap: 10},
  checkInBtn: {flex: 2, backgroundColor: '#fff', borderRadius: 14, paddingVertical: 15, alignItems: 'center'},
  checkInBtnDone: {backgroundColor: '#1a1a0a', borderWidth: 1, borderColor: '#3a2800'},
  checkInText: {color: '#000', fontWeight: '700', fontSize: 15, letterSpacing: 0.5},
  checkInTextDone: {color: '#ff9500'},
  failBtn: {flex: 1, backgroundColor: 'transparent', borderRadius: 14, paddingVertical: 15, alignItems: 'center', borderWidth: 1, borderColor: '#222'},
  failBtnText: {color: '#444', fontSize: 14},
  calendar: {backgroundColor: '#0a0a0a', borderRadius: 16, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: '#1a1a1a'},
  calendarTitle: {fontSize: 12, color: '#444', marginBottom: 12, letterSpacing: 1},
  calendarGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 6},
  calendarDot: {width: 18, height: 18, borderRadius: 4, backgroundColor: '#1a1a1a'},
  calendarDotActive: {backgroundColor: '#ff9500'},
  sleepHint: {marginTop: 20, alignItems: 'center', paddingHorizontal: 32},
  sleepHintText: {fontSize: 14, color: '#555', textAlign: 'center', lineHeight: 22, fontStyle: 'italic', letterSpacing: 0.3},
  addBtn: {position: 'absolute', bottom: 36, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 8},
  addBtnText: {fontSize: 28, color: '#000', lineHeight: 32, fontWeight: '300'},
  modalOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end'},
  modal: {backgroundColor: '#111', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 32, paddingBottom: 48, borderTopWidth: 1, borderColor: '#1e1e1e'},
  modalTitle: {fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 20},
  modalLetterLabel: {fontSize: 13, color: '#555', marginBottom: 8, marginTop: 4, letterSpacing: 0.5},
  input: {backgroundColor: '#1a1a1a', borderRadius: 14, padding: 18, color: '#fff', fontSize: 17, marginBottom: 16, borderWidth: 1, borderColor: '#2a2a2a'},
  letterInput: {minHeight: 80, textAlignVertical: 'top', fontSize: 15, color: '#ccc', fontStyle: 'italic'},
  confirmBtn: {backgroundColor: '#fff', borderRadius: 14, padding: 18, alignItems: 'center', marginBottom: 12},
  confirmBtnDisabled: {backgroundColor: '#1e1e1e'},
  confirmText: {color: '#000', fontWeight: '700', fontSize: 16},
  cancelBtn: {padding: 12, alignItems: 'center'},
  cancelText: {color: '#444', fontSize: 15},
});
