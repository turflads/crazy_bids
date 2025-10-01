import NavBar from '../NavBar';

export default function NavBarExample() {
  return (
    <div>
      <NavBar
        userRole="admin"
        username="Admin User"
        isAuctionLive={true}
        onLogout={() => console.log('Logout clicked')}
      />
    </div>
  );
}
