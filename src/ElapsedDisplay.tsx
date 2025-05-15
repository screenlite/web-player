export const ElapsedDisplay = ({ elapsed }: { elapsed: number }) => {
    return (
        <div className="fixed top-2 right-2 bg-black text-green-400 text-sm font-mono px-2 py-1 rounded shadow-md z-50">
      		Elapsed: {elapsed.toFixed(2)}
        </div>
    )
}