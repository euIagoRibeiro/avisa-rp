import { useState, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Report, ReportStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { useReports } from '../context/ReportsContext';

const STATUS_OPTIONS: Array<{ value: ReportStatus; color: string; bg: string; activeBg: string }> = [
  { value: 'Pendente',   color: '#ef4444', bg: '#fee2e2', activeBg: '#fca5a5' },
  { value: 'Analisando', color: '#f59e0b', bg: '#fef3c7', activeBg: '#fde68a' },
  { value: 'Resolvido',  color: '#22c55e', bg: '#dcfce7', activeBg: '#86efac' },
];

function statusColor(status: ReportStatus) {
  if (status === 'Pendente')   return { color: '#ef4444', bg: '#fee2e2' };
  if (status === 'Analisando') return { color: '#f59e0b', bg: '#fef3c7' };
  return                              { color: '#22c55e', bg: '#dcfce7' };
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

interface Props {
  report: Report | null;
  onClose: () => void;
}

export function ReportDetailModal({ report, onClose }: Props) {
  const { user } = useAuth();
  const { updateStatus, deleteReport } = useReports();
  const isAdmin = user?.role === 'admin';

  const [newStatus, setNewStatus] = useState<ReportStatus>('Pendente');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (report) {
      setNewStatus(report.status);
      setComment('');
    }
  }, [report?.id]);

  async function handleUpdateStatus() {
    if (!report) return;
    if (newStatus === report.status && !comment.trim()) {
      Alert.alert('Nada a atualizar', 'Altere o status ou adicione um comentário.');
      return;
    }
    setSaving(true);
    await updateStatus(report.id, newStatus, comment.trim());
    setSaving(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  }

  async function handleDelete() {
    if (!report) return;
    Alert.alert(
      'Excluir relato',
      'Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await deleteReport(report.id);
            onClose();
          },
        },
      ],
    );
  }

  const badge = report ? statusColor(report.status) : { color: '#9ca3af', bg: '#f3f4f6' };
  const photo = report?.photos[0] ?? null;

  return (
    <Modal visible={!!report} animationType="slide" onRequestClose={onClose}>
      {!!report && (
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: '#f9fafb' }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View
            style={{
              backgroundColor: '#fff',
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingTop: Platform.OS === 'android' ? 16 : 54,
              paddingBottom: 14,
              borderBottomWidth: 1,
              borderBottomColor: '#f0f0f0',
              gap: 12,
            }}
          >
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text
              style={{ flex: 1, fontSize: 16, fontWeight: '700', color: '#111827' }}
              numberOfLines={1}
            >
              {report.title}
            </Text>
            <View
              style={{
                backgroundColor: badge.bg,
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: badge.color }}>
                {report.status}
              </Text>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Photo hero */}
            {!!photo && (
              <Image
                source={{ uri: photo }}
                style={{ width: '100%', height: 200 }}
                resizeMode="cover"
              />
            )}

            {/* Details card */}
            <View
              style={{
                margin: 16,
                backgroundColor: '#fff',
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: '#f0f0f0',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 6,
                  marginBottom: 12,
                }}
              >
                <Ionicons name="pricetag-outline" size={13} color="#9ca3af" />
                <Text style={{ fontSize: 13, color: '#6b7280' }}>{report.category}</Text>
                <Text style={{ color: '#d1d5db' }}>·</Text>
                <Text style={{ fontSize: 13, color: '#9ca3af' }}>
                  {new Date(report.createdAt).toLocaleDateString('pt-BR')}
                </Text>
                {report.isAnonymous && (
                  <>
                    <Text style={{ color: '#d1d5db' }}>·</Text>
                    <Ionicons name="eye-off-outline" size={13} color="#9ca3af" />
                    <Text style={{ fontSize: 13, color: '#9ca3af' }}>Anônimo</Text>
                  </>
                )}
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#f9fafb',
                  borderRadius: 10,
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  marginBottom: 8,
                }}
              >
                <Ionicons name="location-outline" size={14} color="#9ca3af" />
                <Text style={{ fontSize: 13, color: '#6b7280', marginLeft: 6, flex: 1 }}>
                  {report.address}
                </Text>
              </View>

              {isAdmin && (
                report.isAnonymous ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      backgroundColor: '#f3f4f6',
                      borderRadius: 10,
                      paddingHorizontal: 10,
                      paddingVertical: 8,
                      marginBottom: report.description ? 8 : 0,
                    }}
                  >
                    <Ionicons name="eye-off-outline" size={14} color="#9ca3af" />
                    <Text style={{ fontSize: 13, color: '#6b7280' }}>Anônimo</Text>
                  </View>
                ) : (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: '#f9fafb',
                      borderRadius: 10,
                      paddingHorizontal: 10,
                      paddingVertical: 8,
                      gap: 6,
                      marginBottom: report.description ? 8 : 0,
                    }}
                  >
                    <Ionicons name="person-outline" size={14} color="#9ca3af" />
                    <Text style={{ fontSize: 13, color: '#6b7280', flex: 1 }}>
                      {'Denunciante · ' + (report.userName ?? `#${report.userId.slice(0, 8)}`)}
                    </Text>
                  </View>
                )
              )}

              {!!report.description && (
                <Text style={{ fontSize: 14, color: '#374151', lineHeight: 20 }}>
                  {report.description}
                </Text>
              )}
            </View>

            {/* Update history */}
            {report.updates.length > 0 && (
              <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '700',
                    color: '#9ca3af',
                    marginBottom: 10,
                    textTransform: 'uppercase',
                    letterSpacing: 0.8,
                  }}
                >
                  Histórico
                </Text>
                {[...report.updates].reverse().map((upd, i) => {
                  const updBadge = statusColor(upd.status);
                  return (
                    <View
                      key={i}
                      style={{
                        backgroundColor: '#fff',
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 8,
                        borderWidth: 1,
                        borderColor: '#f0f0f0',
                        flexDirection: 'row',
                        gap: 10,
                      }}
                    >
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: updBadge.color,
                          marginTop: 5,
                          flexShrink: 0,
                        }}
                      />
                      <View style={{ flex: 1 }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 8,
                            marginBottom: upd.comment ? 4 : 0,
                          }}
                        >
                          <View
                            style={{
                              backgroundColor: updBadge.bg,
                              borderRadius: 999,
                              paddingHorizontal: 8,
                              paddingVertical: 2,
                            }}
                          >
                            <Text style={{ fontSize: 11, fontWeight: '700', color: updBadge.color }}>
                              {upd.status}
                            </Text>
                          </View>
                          <Text style={{ fontSize: 11, color: '#9ca3af' }}>
                            {formatDateTime(upd.timestamp)}
                          </Text>
                        </View>
                        {!!upd.comment && (
                          <Text style={{ fontSize: 13, color: '#4b5563' }}>{upd.comment}</Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Admin actions */}
            {isAdmin && (
              <View
                style={{
                  margin: 16,
                  marginBottom: 32,
                  backgroundColor: '#fff',
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: '#f0f0f0',
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '700',
                    color: '#9ca3af',
                    marginBottom: 12,
                    textTransform: 'uppercase',
                    letterSpacing: 0.8,
                  }}
                >
                  Atualizar Status
                </Text>

                {/* Status chips */}
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
                  {STATUS_OPTIONS.map(({ value, color, bg, activeBg }) => {
                    const active = newStatus === value;
                    return (
                      <TouchableOpacity
                        key={value}
                        onPress={() => setNewStatus(value)}
                        style={{
                          flex: 1,
                          paddingVertical: 10,
                          borderRadius: 12,
                          backgroundColor: active ? activeBg : bg,
                          borderWidth: 2,
                          borderColor: active ? color : 'transparent',
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: '700', color }}>
                          {value}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Comment input */}
                <TextInput
                  value={comment}
                  onChangeText={setComment}
                  placeholder="Comentário (opcional)"
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={3}
                  style={{
                    backgroundColor: '#f9fafb',
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    fontSize: 14,
                    color: '#111827',
                    textAlignVertical: 'top',
                    marginBottom: 12,
                    minHeight: 72,
                  }}
                />

                {/* Update button */}
                <TouchableOpacity
                  onPress={handleUpdateStatus}
                  disabled={saving}
                  style={{
                    backgroundColor: '#2563eb',
                    borderRadius: 12,
                    paddingVertical: 14,
                    alignItems: 'center',
                    marginBottom: 10,
                  }}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
                      Atualizar Status
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Delete button */}
                <TouchableOpacity
                  onPress={handleDelete}
                  style={{
                    borderWidth: 1,
                    borderColor: '#fca5a5',
                    borderRadius: 12,
                    paddingVertical: 13,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#ef4444', fontWeight: '600', fontSize: 14 }}>
                    Excluir Relato
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </Modal>
  );
}
