import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Image, Modal } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../src/constants/colors';
import { useResponsive } from '../../src/hooks/useResponsive';
import { Loading } from '../../src/components/ui/Loading';
import { API } from '../../src/constants/api';
import apiClient from '../../src/services/api';
import { getImageUrl } from '../../src/utils/getImageUrl';
const { width } = Dimensions.get('window');

const CITIES = [
  { name: 'Nouakchott', lat: 18.0735, lng: -15.9780 },
  { name: 'Nouadhibou', lat: 20.9320, lng: -17.0374 },
  { name: 'Rosso', lat: 16.5138, lng: -15.8050 },
  { name: 'Kiffa', lat: 16.6166, lng: -11.4045 },
  { name: 'Kaédi', lat: 16.1492, lng: -13.5042 },
  { name: 'Zouérat', lat: 22.7161, lng: -12.4721 },
  { name: 'Atar', lat: 20.5169, lng: -13.0531 },
];

interface MapReport {
  id: string;
  type: 'lost' | 'found';
  title: string;
  category: string;
  city: string;
  coordinates: [number, number];
  image?: string | null;
}

export default function MapScreen() {
  const [reports, setReports] = useState<MapReport[]>([]);
  const [region, setRegion] = useState({
    latitude: 18.0735,
    longitude: -15.9780,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [selectedGroup, setSelectedGroup] = useState<MapReport[] | null>(null);
  const [showCitySelector, setShowCitySelector] = useState(false);
  const mapRef = useRef<MapView>(null);
  const { isTablet, contentMaxWidth, containerMaxWidth, width } = useResponsive();

  const loadReportsForRegion = async (reg: { latitude: number; longitude: number; latitudeDelta: number }) => {
    try {
      // Calcul approximatif du rayon visible en km
      const radius = Math.max(10, (reg.latitudeDelta * 111) / 2);
      const { data } = await apiClient.get(API.ENDPOINTS.MAP.REPORTS, {
        params: { lat: reg.latitude, lng: reg.longitude, radius, limit: 200 }
      });
      const allReports: MapReport[] = [
        ...(data.reports?.lost || []).map((r: any) => ({ ...r, type: 'lost' })),
        ...(data.reports?.found || []).map((r: any) => ({ ...r, type: 'found' })),
      ];
      setReports(allReports);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      let initialReg = region;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          initialReg = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          };
          setRegion(initialReg);
        }
      } catch (err) {
        console.error(err);
      }

      await loadReportsForRegion(initialReg);
      setLoading(false);
    };
    init();
  }, []);

  const filtered = filter === 'all' ? reports : reports.filter((r) => r.type === filter);

  // Regroupement par coordonnées exactes
  const groupedReports = Object.values(filtered.reduce((acc, report) => {
    // Utiliser une précision à 5 décimales pour regrouper les objets quasi superposés
    const key = `${report.coordinates[0].toFixed(5)}-${report.coordinates[1].toFixed(5)}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(report);
    return acc;
  }, {} as Record<string, MapReport[]>));

  if (loading) return <Loading fullScreen message="Chargement de la carte..." />;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton={false}
        onPress={() => setSelectedGroup(null)} // Fermer la carte au clic sur la map
        onRegionChangeComplete={(newRegion) => {
          setRegion(newRegion);
          loadReportsForRegion(newRegion);
        }}
      >
        {groupedReports.map((group, index) => {
          const isCluster = group.length > 1;
          const firstReport = group[0];
          
          return (
            <Marker
              key={`marker-${firstReport.id}`}
              coordinate={{
                latitude: firstReport.coordinates[1],
                longitude: firstReport.coordinates[0],
              }}
              onPress={(e) => {
                e.stopPropagation();
                setSelectedGroup(group);
              }}
            >
              {isCluster ? (
                <View style={[styles.markerContainer, styles.clusterMarker]}>
                  <Text style={styles.clusterText}>{group.length}</Text>
                </View>
              ) : firstReport.image ? (
                <View style={[styles.markerContainer, firstReport.type === 'lost' ? styles.lostMarker : styles.foundMarker, { padding: 2 }]}>
                  <Image source={{ uri: getImageUrl(firstReport.image)! }} style={{ width: '100%', height: '100%', borderRadius: 16 }} />
                </View>
              ) : (
                <View style={[styles.markerContainer, firstReport.type === 'lost' ? styles.lostMarker : styles.foundMarker]}>
                  <Ionicons 
                    name={firstReport.type === 'lost' ? 'search' : 'checkmark-circle'} 
                    size={20} 
                    color={Colors.textInverse} 
                  />
                </View>
              )}
            </Marker>
          );
        })}
      </MapView>

      {/* Barre de filtres flottante en haut */}
      <View style={[styles.topOverlay, { maxWidth: containerMaxWidth, alignSelf: 'center' }]}>
        <View style={styles.filterContainer}>
          {(['all', 'lost', 'found'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
              onPress={() => {
                setFilter(f);
                setSelectedGroup(null);
              }}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f === 'all' ? 'Tous' : f === 'lost' ? 'Perdus' : 'Trouvés'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bottom Card pour les détails du ou des marqueurs */}
      {selectedGroup && (
        <View style={[styles.bottomCardContainer, { maxWidth: containerMaxWidth, alignSelf: 'center' }]}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            snapToInterval={width * 0.85 + Spacing.lg}
            decelerationRate="fast"
          >
            {selectedGroup.map((report) => (
              <TouchableOpacity 
                key={report.id} 
                style={styles.card}
                activeOpacity={0.9}
                onPress={() => router.push(`/${report.type}/${report.id}`)}
              >
                {report.image ? (
                  <Image source={{ uri: getImageUrl(report.image)! }} style={styles.cardImage} />
                ) : (
                  <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
                    <Ionicons name="image-outline" size={32} color={Colors.textTertiary} />
                  </View>
                )}
                
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.badge, report.type === 'lost' ? styles.badgeLost : styles.badgeFound]}>
                      <Text style={[styles.badgeText, report.type === 'lost' ? styles.badgeTextLost : styles.badgeTextFound]}>
                        {report.type === 'lost' ? 'Perdu' : 'Trouvé'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.cardTitle} numberOfLines={1}>{report.title}</Text>
                  <View style={styles.cardFooter}>
                    <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
                    <Text style={styles.cardLocation} numberOfLines={1}>{report.city || 'Position'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Floating Action Button pour les villes */}
      <TouchableOpacity 
        style={[styles.cityFab, isTablet && { right: Math.max((width - containerMaxWidth) / 2 + Spacing.lg, Spacing.lg) }]} 
        onPress={() => setShowCitySelector(true)}
      >
        <Ionicons name="navigate" size={24} color={Colors.textInverse} />
      </TouchableOpacity>

      {/* Modale de sélection de ville */}
      <Modal visible={showCitySelector} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowCitySelector(false)} activeOpacity={1}>
          <View style={[styles.modalContent, { maxWidth: contentMaxWidth }]}>
            <Text style={styles.modalTitle}>Aller à...</Text>
            {CITIES.map((city) => (
              <TouchableOpacity
                key={city.name}
                style={styles.cityBtn}
                onPress={() => {
                  setShowCitySelector(false);
                  const newRegion = {
                    latitude: city.lat,
                    longitude: city.lng,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                  };
                  mapRef.current?.animateToRegion(newRegion, 1000);
                  loadReportsForRegion(newRegion);
                }}
              >
                <Ionicons name="location-outline" size={20} color={Colors.textSecondary} />
                <Text style={styles.cityText}>{city.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  map: { flex: 1 },
  topOverlay: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: BorderRadius.full,
    padding: Spacing.xs,
    ...Shadow.md,
  },
  filterBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
  },
  filterBtnActive: { backgroundColor: Colors.primary },
  filterText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  filterTextActive: { color: Colors.textInverse },
  
  // Custom Markers
  markerContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
    ...Shadow.sm,
  },
  lostMarker: { backgroundColor: Colors.lost },
  foundMarker: { backgroundColor: Colors.found },
  clusterMarker: { 
    backgroundColor: Colors.secondary, 
    width: 44, 
    height: 44, 
    borderRadius: 22,
    borderColor: Colors.surface,
    borderWidth: 3,
    ...Shadow.md
  },
  clusterText: { color: Colors.textInverse, fontWeight: 'bold', fontSize: FontSize.md },

  // Bottom Card
  bottomCardContainer: {
    position: 'absolute',
    bottom: Spacing.xxxl + 20,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  card: {
    width: width * 0.85,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    marginRight: Spacing.lg,
    ...Shadow.lg,
    overflow: 'hidden',
  },
  cardImage: {
    width: 100,
    height: 100,
  },
  cardImagePlaceholder: {
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  cardHeader: {
    alignItems: 'flex-start',
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  badgeLost: { backgroundColor: Colors.lostLight },
  badgeFound: { backgroundColor: Colors.foundLight },
  badgeText: { fontSize: FontSize.xs, fontWeight: 'bold' },
  badgeTextLost: { color: Colors.lost },
  badgeTextFound: { color: Colors.found },
  cardTitle: {
    fontSize: FontSize.md,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  cardLocation: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginLeft: 4,
    flex: 1,
  },
  
  // City Selector
  cityFab: {
    position: 'absolute',
    bottom: Spacing.xxxl + 80,
    right: Spacing.lg,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
    zIndex: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    width: '80%',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadow.lg,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  cityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  cityText: {
    fontSize: FontSize.md,
    color: Colors.text,
    marginLeft: Spacing.md,
  },
});