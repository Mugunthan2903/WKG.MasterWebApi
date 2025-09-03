using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using WKG.Masters.Model;
using static System.Net.Mime.MediaTypeNames;

namespace WKG.Masters.Services
{
    public class StaticData
    {
        #region SSM010 
        public static class SSM010SC
        {
            public static List<SelectBox> HomePageList { get; } = new List<SelectBox>
            {
                new () { ID = "T", Text = "To do" },
                new () { ID = "S", Text = "Slide" },
                new () { ID = "H", Text = "Help" },
                new () { ID = "C", Text = "Cancel" },
                new () { ID = "F", Text = "Flight" },
            };
            public static List<SelectBox> JourneyTpyeList { get; } = new List<SelectBox>
            {
                new () { ID = "A", Text = "Arrival" },
                new () { ID = "D", Text = "Departure" },
            };
            public static List<SelectBox> CartypeList { get; } = new List<SelectBox>
            {
                new () { ID = "B", Text = "Hybrid" },
                new () { ID = "E", Text = "Eshuttle" },
                new () { ID = "U", Text = "Uber" },
            };
            public static List<SelectBox> HomescreenList { get; } = new List<SelectBox>
            {
                new () { ID = "S", Text = "Standard", Default = true },
                new () { ID = "U", Text = "Only Uber" },
                new () { ID = "F", Text = "Uber With Flight" },
                new () { ID = "B", Text = "Uber Berlin" },
                new () { ID = "2", Text = "Home Screen 2" },
                new () { ID = "D", Text = "OTH-Heathrow" },
                new () { ID = "T", Text = "Home Screen 3" },
                new () { ID = "P", Text = "UberPin" },
            };
            public static List<SelectBox> PaymentTypeList { get; } = new List<SelectBox>
            {
                new () { ID = "S", Text = "SagePay" },
                new () { ID = "H", Text = "Handpoint" },
                new () { ID = "F", Text = "FreedomPay" },
            };
            public static List<SelectBox> UberSupplierList { get; } = new List<SelectBox>
            {
                new () { ID = "U", Text = "Uber", Default = true},
                new () { ID = "UL", Text = "Uber London" },
                new () { ID = "UA", Text = "Uber Arena" },
                new () { ID = "UP", Text = "UberPin" },
            };
            public static List<SelectBox> UberPricingList { get; } = new List<SelectBox>
            {
                new () { ID = "N", Text = "No Booking Fee", Default = true},
                new () { ID = "Y", Text = "With Booking Fee" },
                new () { ID = "S", Text = "Separate Booking Fee" },
            };
            public static string Pos_code { get; } = "SSM";

            public static Dictionary<string, string> HomeScreenTypes { get; } = new Dictionary<string, string> { { "Standard", "S" }, { "OnlyUber", "U" }, { "UberWithFlight", "F" }, { "UberBerlin", "B" }, { "HomeScreen2", "2" }, { "OTHHeathrow", "D" }, { "Tenerife", "T" } , { "UberPin", "P" } };
        }

        #endregion

        #region SSM012 
        public static class SSM012SC
        {
            public static Dictionary<string, string> LinkType { get; } = new Dictionary<string, string> { { "Page", "PAGE" }, { "Product", "PRODUCT" }, { "Category", "CATEGORY" } };

            public static List<SelectBox> TypeList { get; } = new List<SelectBox>
            {
                new () { ID = "I", Text = "Image" },
                new () { ID = "C", Text = "Background Color",Default = true  },
                new () { ID = "B", Text = "Button" },
            };
            public static string Image { get; } = "I";
            public static string BackgroundColor { get; } = "C";
            public static string Button { get; } = "B";
        }
        #endregion

        #region SSM015 
        public static class SSM015SC
        {
            public static int SessionTimeoutSec { get; } = 30;
            public static int AutoCloseTimeoutSec { get; } = 59;
            public static int OnlineTimeoutMilliSec { get; } = 1000;
            public static int OnlineCheckMilliSec { get; } = 10000;
            public static int PaymentWaitMin { get; } = 2;
            //public static List<SelectBox> GmapCountryCodeList { get; } = new List<SelectBox>
            //{
            //    new () { ID = "GB", Text = "United Kingdom",Default=true },
            //    new () { ID = "DE", Text = "Germany" },
            //};
            public static List<SelectBox> ThemeList { get; } = new List<SelectBox>
            {
                new () { ID = "wkl", Text = "wkl" }
            };
            public static List<SelectBox> PaymentDeviceLocation { get; } = new List<SelectBox>
            {
                new () { ID = "R", Text = "Right" },
                new () { ID = "B", Text = "Bottom" },
            };
        }

        #endregion

        #region SSM017 
        public static class SSM017SC
        {
            public static Dictionary<string, string> CarType { get; } = new Dictionary<string, string> { { "Hybrid", "B" }, { "Eshuttle", "E" } };
        }
        #endregion

        #region SSM040 
        public static class SSM040SC
        {
            public static Dictionary<string, (string Value, int SortOrder)> Group_List { get; } = new Dictionary<string, (string Value, int SortOrder)> { { "G", ("General", 1) }, { "H", ("Home Page", 2) }, { "T", ("Tour", 3) }, { "D", ("Distribusion", 4) }, { "C", ("Car Transfer", 5) } };
        }
        #endregion

        #region SSM071
        public static class SSM070Sc
        {
            public static Dictionary<string, string> EndPointType { get; } = new Dictionary<string, string> { { "Sandbox", "S" }, { "Production", "P" } };
        }
        #endregion

        #region SSM090 
        public static class SSM090SC
        {
            public static string DataTypeCode { get; } = "UBERARENA";
        }

        #endregion

        #region SupplierMapId
        public static class SupplierMapId
        {
            public static string Bigbus { get; } = "BG";
            public static string TUI { get; } = "TUI";
            public static string LondonTheatreDirect { get; } = "LTD";
            public static string LondonPass { get; } = "LP";
            public static string GoldenTours { get; } = "GT2";
            public static string ToothBus { get; } = "TB";
            public static string Distribusion { get; } = "DB";
        }
        #endregion

        #region Common 
        public static class Common
        {
            public static Dictionary<string, string> BookingFeeType { get; } = new Dictionary<string, string> { { "Percentage", "P" }, { "Fixed", "F" } };
            public static Dictionary<string, string> LP_Prod_Type { get; } = new Dictionary<string, string> { { "LondonPass", "Lndnps" }, { "ExplorerPass", "Explrps" } };
            public static string DefaultLangCode { get; } = "en-GB";
        }

        #endregion
        #region Distibusion 

        public static class Distibusion
        {
            public static Dictionary<string, string> DstrbnLocType { get; } = new Dictionary<string, string> { { "Station", "S" }, { "Area", "A" }, { "City", "C" } };
        }
        #endregion
    }
}
