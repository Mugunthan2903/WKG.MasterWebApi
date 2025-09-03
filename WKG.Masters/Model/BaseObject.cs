using WKL.Service.Domain;

namespace WKG.Masters.Model
{
    public class OperationStatus
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; }
    }
    public class OperationStatus<T>
    {
        public T Data { get; set; }
        public bool IsSuccess { get; set; }
        public string Message { get; set; }
    }
    public class SessionInfo
    {
        public string MachineID { get; set; }
        public string BrowserInfo { get; set; }
        public string UserID { get; set; }
    }
    public class ProductObject
    {
        public class SimpleSearchInput
        {
            public string Text { get; set; }
        }
        public class SearchInput
        {
            public string Name { get; set; }
        }
        public class Product : BaseObject<string>
        { }

        public class PageSearchInfo
        {
            public int PageNo { get; set; }
            public int PageSize { get; set; }
        }
    }

    public class ChatMessageInput
    {
        public string Name { get; set; }
        public string Text { get; set; }
    }


}
