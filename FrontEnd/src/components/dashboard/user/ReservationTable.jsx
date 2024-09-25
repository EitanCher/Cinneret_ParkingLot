import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@nextui-org/react';
import { useState } from 'react';

const ReservationTable = ({ slots, onTimeframeSelect }) => {
  const [selectedTimeframes, setSelectedTimeframes] = useState([]); // Track selected timeframes

  const currentTime = new Date();

  const handleTimeframeClick = (slotId, timeFrame) => {
    const timeframeKey = `${slotId}-${timeFrame.start}-${timeFrame.end}`;

    // Check if this timeframe is already selected
    const isSelected = selectedTimeframes.some((tf) => tf.key === timeframeKey);

    if (isSelected) {
      // If the timeframe is already selected, deselect it and clear the following selections
      const newTimeframes = selectedTimeframes.filter((tf) => tf.key !== timeframeKey);
      setSelectedTimeframes(newTimeframes);
      onTimeframeSelect(newTimeframes);
    } else {
      // Check if this timeframe is consecutive to the last one
      if (selectedTimeframes.length > 0) {
        const lastTimeframe = selectedTimeframes[selectedTimeframes.length - 1];
        const lastEndTime = new Date(lastTimeframe.end);
        const newStartTime = new Date(timeFrame.start);

        if (newStartTime.getTime() !== lastEndTime.getTime()) {
          alert('You must select consecutive timeframes.');
          return; // Prevent non-consecutive selection
        }
      }

      // Add to selection if it is consecutive
      const newTimeframes = [...selectedTimeframes, { key: timeframeKey, slotId, start: timeFrame.start, end: timeFrame.end }];

      setSelectedTimeframes(newTimeframes);
      onTimeframeSelect(newTimeframes);
    }
  };

  const isTimeframeSelected = (slotId, timeFrame) => {
    return selectedTimeframes.some((tf) => tf.slotId === slotId && tf.start === timeFrame.start && tf.end === timeFrame.end);
  };

  return (
    <Table aria-label='Available Time Slots'>
      <TableHeader>
        <TableColumn>SLOT ID</TableColumn>
        <TableColumn>TIMEFRAMES</TableColumn> {/* This will display timeframes horizontally */}
      </TableHeader>
      <TableBody>
        {slots.map((slot) => (
          <TableRow key={slot.slotId}>
            {/* Display Slot ID */}
            <TableCell>{slot.slotId}</TableCell>

            {/* Display timeframes for the slot */}
            <TableCell>
              <div style={{ display: 'flex', gap: '8px' }}>
                {' '}
                {/* Horizontally align the timeframes */}
                {slot.timeFrames.map((timeFrame, index) => {
                  const isOccupied = !timeFrame.available;
                  const isSelected = isTimeframeSelected(slot.slotId, timeFrame);

                  return (
                    <div
                      key={index}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: isSelected ? 'blue' : isOccupied ? 'red' : 'green', // Blue for selected, red for occupied, green for available
                        color: 'white',
                        borderRadius: '4px',
                        cursor: timeFrame.available ? 'pointer' : 'not-allowed', // Only allow clicking if available
                        opacity: timeFrame.available ? 1 : 0.5 // Fade out unavailable ones
                      }}
                      onClick={() => timeFrame.available && handleTimeframeClick(slot.slotId, timeFrame)} // Only allow selection if available
                      title={`From: ${new Date(timeFrame.start).toLocaleTimeString()} - To: ${new Date(timeFrame.end).toLocaleTimeString()}`} // Tooltip to show time details
                    >
                      {new Date(timeFrame.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                      {new Date(timeFrame.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  );
                })}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ReservationTable;
