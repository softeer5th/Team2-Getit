import AnimatedContainer from "../container/animatedContainer";
import NavigationDescription from "./navigation/navigationDescription";
type TopBarProps = {
	isVisible: boolean;
};

const TopBar = ({ isVisible }: TopBarProps) => {
	return (
		<AnimatedContainer
			isVisible={isVisible}
			positionDelta={286}
			className="absolute top-0 z-10 max-w-[450px] w-full min-h-[143px] bg-gray-100 flex flex-col items-center justify-center rounded-b-4xl shadow-lg"
			isTop={true}
			transition={{ type: "spring", damping: 20, duration: 0.3 }}
		>
			<NavigationDescription isDetailView={!isVisible} />
		</AnimatedContainer>
	);
};

export default TopBar;
