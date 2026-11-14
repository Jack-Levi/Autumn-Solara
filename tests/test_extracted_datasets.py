import unittest
import os
import pandas as pd

class TestExtractedDatasets(unittest.TestCase):
    def setUp(self):
        # Resolve repo root directory (one level up from tests/)
        self.base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    def test_directory_structure(self):
        expected_dirs = [
            os.path.join(self.base_dir, "LUNA", "topografia"),
            os.path.join(self.base_dir, "LUNA", "temperatura"),
            os.path.join(self.base_dir, "MARTE", "topografia"),
            os.path.join(self.base_dir, "MARTE", "temperatura")
        ]
        for d in expected_dirs:
            self.assertTrue(os.path.isdir(d), f"Missing directory: {d}")

    def test_mars_topography_datasets(self):
        # Standardized datasets in MARTE/topografia
        files = [
            ("Alba_Mons_Tharsis_volcan_MOLA_DEM.csv", 100),
            ("Jezero_Crater_Perseverance_MOLA_DEM.csv", 100),
            ("Gusev_Crater_Spirit_Columbia_Hills_MOLA_DEM.csv", 99),
            ("Jezero_Crater_Delta_Transect_MOLA_DEM.csv", 100),
            ("Korolev_Crater_Water_Ice_MOLA_DEM.csv", 100),
            ("Meridiani_Planum_Opportunity_MOLA_DEM.csv", 100),
            ("Noctis_Labyrinthus_Valles_Marineris_MOLA_DEM.csv", 100)
        ]
        for fname, expected_len in files:
            path = os.path.join(self.base_dir, "MARTE", "topografia", fname)
            self.assertTrue(os.path.isfile(path), f"File not found: {path}")
            df = pd.read_csv(path)
            self.assertEqual(len(df), expected_len, f"Expected {expected_len} points in {fname}, got {len(df)}")
            self.assertIn("Longitude", df.columns, f"Longitude missing in {fname}")
            self.assertIn("Latitude", df.columns, f"Latitude missing in {fname}")
            self.assertIn("Distance", df.columns, f"Distance missing in {fname}")
            self.assertIn("MGS MOLA: Global DEM", df.columns, f"MGS MOLA column missing in {fname}")
            self.assertFalse(df.isnull().any().any(), f"Null values found in {fname}")

    def test_luna_topography_datasets(self):
        files = [
            "Copernicus_Crater_LOLA_DEM.csv",
            "Shackleton_Crater_Polo_Sur_Artemis_LOLA_DEM.csv"
        ]
        for fname in files:
            path = os.path.join(self.base_dir, "LUNA", "topografia", fname)
            self.assertTrue(os.path.isfile(path), f"File not found: {path}")
            df = pd.read_csv(path)
            self.assertEqual(len(df), 100, f"Expected 100 points in {fname}, got {len(df)}")
            self.assertIn("Longitude", df.columns)
            self.assertIn("Latitude", df.columns)
            self.assertIn("Distance", df.columns)
            lola_col = [c for c in df.columns if "LOLA" in c]
            self.assertTrue(len(lola_col) > 0, f"LOLA column missing in {fname}")
            self.assertFalse(df.isnull().any().any(), f"Null values found in {fname}")

    def test_mars_temperature_datasets(self):
        files = [
            "Alba_Mons_temperatura_inercia_TES_THEMIS.csv",
            "Jezero_Crater_temperatura_inercia_TES_THEMIS.csv"
        ]
        for fname in files:
            path = os.path.join(self.base_dir, "MARTE", "temperatura", fname)
            self.assertTrue(os.path.isfile(path), f"File not found: {path}")
            df = pd.read_csv(path)
            self.assertEqual(len(df), 24, f"Expected 24 hours in {fname}, got {len(df)}")
            self.assertIn("Local_Solar_Time_Hour", df.columns)
            self.assertIn("Surface_Temp_K", df.columns)
            self.assertIn("TES_Thermal_Inertia_Jm2K1s05", df.columns)

    def test_luna_temperature_datasets(self):
        copernicus_path = os.path.join(self.base_dir, "LUNA", "temperatura", "Copernicus_Crater_temperatura_diviner.csv")
        self.assertTrue(os.path.isfile(copernicus_path))
        df_cop = pd.read_csv(copernicus_path)
        self.assertEqual(len(df_cop), 24)
        self.assertIn("Hour_LST", df_cop.columns)
        self.assertIn("Surface_Temp_K", df_cop.columns)

        shackleton_path = os.path.join(self.base_dir, "LUNA", "temperatura", "Shackleton_Crater_temperatura_diviner.csv")
        self.assertTrue(os.path.isfile(shackleton_path))
        df_shack = pd.read_csv(shackleton_path)
        self.assertGreaterEqual(len(df_shack), 50)
        self.assertIn("T_Annual_Avg_K", df_shack.columns)
        self.assertIn("Is_Permanently_Shadowed", df_shack.columns)

if __name__ == "__main__":
    unittest.main()
